"""
Thread Management Endpoints
Handles conversation threads with optimized queries
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from models.schemas import CreateThreadRequest, UpdateThreadRequest, ThreadDetail, ThreadListItem
from utils.security import get_current_user
from utils.supabase_client import get_supabase
from typing import List, Dict, Optional
from datetime import datetime

router = APIRouter()


@router.get("/", response_model=List[ThreadListItem])
async def list_threads(
    user: Dict = Depends(get_current_user),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    saved_only: bool = Query(default=False)
):
    """
    List all threads for the current user with optimized query
    Uses a single query with embedded messages to avoid N+1 problem
    """
    supabase = get_supabase()
    
    # Build query with embedded messages (PostgREST foreign key embedding)
    query = supabase.table("threads").select(
        "id, title, total_tokens_used, last_activity, is_saved, created_at, "
        "messages(id, content, role, created_at)"
    ).eq("user_id", user['id'])
    
    # Filter saved threads if requested
    if saved_only:
        query = query.eq("is_saved", True)
    
    # Order by last activity and apply pagination
    query = query.order("last_activity", desc=True).range(offset, offset + limit - 1)
    
    res = query.execute()
    
    threads = []
    for t in res.data:
        messages = t.get('messages', [])
        
        # Sort messages by created_at to get the latest
        sorted_messages = sorted(
            messages, 
            key=lambda m: m.get('created_at', ''), 
            reverse=True
        )
        
        # Get preview from latest assistant message or latest message
        preview = ""
        if sorted_messages:
            # Try to find the latest assistant message first
            for msg in sorted_messages:
                if msg.get('role') == 'assistant':
                    preview = msg.get('content', '')[:100]
                    break
            # Fallback to latest message
            if not preview:
                preview = sorted_messages[0].get('content', '')[:100]
        
        threads.append({
            "id": t['id'],
            "title": t['title'],
            "message_count": len(messages),
            "total_tokens_used": t['total_tokens_used'],
            "last_activity": t['last_activity'],
            "is_saved": t['is_saved'],
            "preview": preview
        })
    
    return threads


@router.get("/count")
async def get_thread_count(user: Dict = Depends(get_current_user)):
    """
    Get total thread count for pagination
    """
    supabase = get_supabase()
    
    # Use count query
    res = supabase.table("threads").select("id", count="exact").eq("user_id", user['id']).execute()
    
    return {
        "total": res.count or 0,
        "saved": supabase.table("threads").select("id", count="exact").eq("user_id", user['id']).eq("is_saved", True).execute().count or 0
    }


@router.post("/", response_model=Dict)
async def create_thread(
    request: CreateThreadRequest,
    user: Dict = Depends(get_current_user)
):
    """
    Create a new thread
    """
    supabase = get_supabase()
    
    thread_data = {
        "user_id": user['id'],
        "title": request.title or "New Thread",
        "is_saved": user['plan'] != 'hobby',
        "expires_at": None if user['plan'] != 'hobby' else (
            datetime.now().isoformat()  # Would add 24h in real implementation
        )
    }
    
    res = supabase.table("threads").insert(thread_data).execute()
    
    return res.data[0]


@router.get("/{thread_id}", response_model=ThreadDetail)
async def get_thread(thread_id: str, user: Dict = Depends(get_current_user)):
    """
    Get a specific thread with all messages
    """
    supabase = get_supabase()
    
    # Get thread and verify ownership
    thread_res = supabase.table("threads").select("*").eq("id", thread_id).eq("user_id", user['id']).single().execute()
    
    if not thread_res.data:
        raise HTTPException(status_code=404, detail="Thread not found")
    
    # Get messages ordered by creation time
    msg_res = supabase.table("messages").select(
        "id, role, content, tokens_used, input_tokens, output_tokens, created_at"
    ).eq("thread_id", thread_id).order("created_at", desc=False).execute()
    
    return {
        **thread_res.data,
        "messages": msg_res.data
    }


@router.patch("/{thread_id}")
async def update_thread(
    thread_id: str, 
    request: UpdateThreadRequest, 
    user: Dict = Depends(get_current_user)
):
    """
    Update thread title
    """
    supabase = get_supabase()
    
    # Verify ownership first
    existing = supabase.table("threads").select("id").eq("id", thread_id).eq("user_id", user['id']).single().execute()
    
    if not existing.data:
        raise HTTPException(status_code=404, detail="Thread not found")
    
    # Update thread
    res = supabase.table("threads").update({
        "title": request.title,
        "updated_at": datetime.now().isoformat()
    }).eq("id", thread_id).execute()
    
    if not res.data:
        raise HTTPException(status_code=500, detail="Failed to update thread")
    
    return res.data[0]


@router.patch("/{thread_id}/save")
async def toggle_save_thread(
    thread_id: str,
    user: Dict = Depends(get_current_user)
):
    """
    Toggle thread saved status (for hobby users to save important threads)
    """
    supabase = get_supabase()
    
    # Get current thread
    thread_res = supabase.table("threads").select("is_saved").eq("id", thread_id).eq("user_id", user['id']).single().execute()
    
    if not thread_res.data:
        raise HTTPException(status_code=404, detail="Thread not found")
    
    # Toggle saved status
    new_saved = not thread_res.data['is_saved']
    
    res = supabase.table("threads").update({
        "is_saved": new_saved,
        "expires_at": None if new_saved else datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }).eq("id", thread_id).execute()
    
    return {
        "id": thread_id,
        "is_saved": new_saved,
        "message": "Thread saved" if new_saved else "Thread unsaved"
    }


@router.delete("/{thread_id}")
async def delete_thread(thread_id: str, user: Dict = Depends(get_current_user)):
    """
    Delete a thread and all its messages
    """
    supabase = get_supabase()
    
    # Verify ownership first
    existing = supabase.table("threads").select("id").eq("id", thread_id).eq("user_id", user['id']).single().execute()
    
    if not existing.data:
        raise HTTPException(status_code=404, detail="Thread not found")
    
    # Delete thread (messages will be cascade deleted)
    supabase.table("threads").delete().eq("id", thread_id).execute()
    
    return {"message": "Thread deleted", "id": thread_id}


@router.delete("/")
async def delete_all_threads(
    user: Dict = Depends(get_current_user),
    saved_too: bool = Query(default=False)
):
    """
    Delete all threads for the user
    By default, keeps saved threads unless saved_too=True
    """
    supabase = get_supabase()
    
    query = supabase.table("threads").delete().eq("user_id", user['id'])
    
    if not saved_too:
        query = query.eq("is_saved", False)
    
    query.execute()
    
    return {
        "message": "Threads deleted",
        "kept_saved": not saved_too
    }
