"""
Script Library Endpoints
"""
from fastapi import APIRouter, HTTPException, Depends
from models.schemas import SaveScriptRequest, UpdateScriptRequest, ScriptDetail, ScriptListItem
from utils.security import get_current_user
from utils.supabase_client import get_supabase
from typing import List, Dict

router = APIRouter()

@router.post("/", response_model=ScriptDetail)
async def save_script(request: SaveScriptRequest, user: Dict = Depends(get_current_user)):
    supabase = get_supabase()
    data = {
        **request.model_dump(),
        "user_id": user['id']
    }
    res = supabase.table("scripts").insert(data).execute()
    return res.data[0]

@router.get("/", response_model=List[ScriptListItem])
async def list_scripts(user: Dict = Depends(get_current_user)):
    supabase = get_supabase()
    res = supabase.table("scripts").select("*").eq("user_id", user['id']).order("created_at", desc=True).execute()
    
    scripts = []
    for s in res.data:
        scripts.append({
            **s,
            "code_preview": s['code'][:150] + "..."
        })
    return scripts

@router.get("/{script_id}", response_model=ScriptDetail)
async def get_script(script_id: str, user: Dict = Depends(get_current_user)):
    supabase = get_supabase()
    res = supabase.table("scripts").select("*").eq("id", script_id).eq("user_id", user['id']).single().execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Script not found")
    return res.data

@router.patch("/{script_id}")
async def update_script(script_id: str, request: UpdateScriptRequest, user: Dict = Depends(get_current_user)):
    supabase = get_supabase()
    res = supabase.table("scripts").update(request.model_dump(exclude_unset=True)).eq("id", script_id).eq("user_id", user['id']).execute()
    return res.data[0]

@router.delete("/{script_id}")
async def delete_script(script_id: str, user: Dict = Depends(get_current_user)):
    supabase = get_supabase()
    supabase.table("scripts").delete().eq("id", script_id).eq("user_id", user['id']).execute()
    return {"message": "Script deleted"}
