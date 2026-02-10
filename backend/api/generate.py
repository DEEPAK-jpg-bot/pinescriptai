"""
AI Code Generation Endpoints
Handles code generation, explanation, and refinement
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Dict, Optional
from models.schemas import GenerateRequest, GenerateResponse
from services.ai_service import generate_pine_script, explain_code, refine_code
from services.token_service import check_token_balance, deduct_tokens
from services.cache_service import get_cached_response, cache_response
from utils.security import get_current_user
from utils.rate_limiter import check_user_rate_limit, check_gemini_limits, record_gemini_usage
from utils.supabase_client import get_supabase
from utils.helpers import tokens_to_words, estimate_tokens, calculate_expires_at, sanitize_prompt
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


# Additional request/response schemas
class ExplainRequest(BaseModel):
    code: str = Field(..., min_length=10, max_length=50000)
    thread_id: Optional[str] = None


class ExplainResponse(BaseModel):
    explanation: str
    tokens_used: int
    tokens_remaining: int


class RefineRequest(BaseModel):
    code: str = Field(..., min_length=10, max_length=50000)
    instruction: str = Field(..., min_length=5, max_length=2000)
    thread_id: Optional[str] = None


class RefineResponse(BaseModel):
    code: str
    tokens_used: int
    tokens_remaining: int
    thread_id: Optional[str] = None


@router.post("/generate", response_model=GenerateResponse)
async def generate_code(
    request: GenerateRequest,
    user: Dict = Depends(get_current_user)
):
    """
    Generate Pine Script code from natural language prompt
    """
    supabase = get_supabase()
    
    # Sanitize prompt
    prompt = sanitize_prompt(request.prompt)
    
    # Check user rate limit
    check_user_rate_limit(user['id'], user['plan'])
    
    # Estimate tokens needed
    estimated_tokens = estimate_tokens(prompt)
    
    # Check if prompt exceeds max input tokens
    if estimated_tokens > user['max_input_tokens']:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "prompt_too_long",
                "message": f"Prompt too long ({estimated_tokens} tokens). Max {user['max_input_tokens']} tokens for {user['plan']} plan.",
                "estimated_tokens": estimated_tokens,
                "max_tokens": user['max_input_tokens'],
                "upgrade_hint": "Upgrade your plan to increase the limit."
            }
        )
    
    # Check token balance (only for non-cached requests, estimated)
    if not await check_token_balance(user, estimated_tokens):
        raise HTTPException(
            status_code=400,
            detail={
                "error": "insufficient_tokens",
                "message": f"Insufficient tokens. You have {user['tokens_remaining']} tokens remaining.",
                "tokens_remaining": user['tokens_remaining'],
                "estimated_needed": estimated_tokens
            }
        )
    
    # Check cache first - cached responses are FREE (no token deduction)
    cached_response = await get_cached_response(prompt)
    if cached_response:
        logger.info(f"Cache hit for user {user['id']}")
        
        # For cached responses, we create a new thread/message but don't deduct tokens
        thread_id = request.thread_id
        
        if not thread_id:
            # Create new thread
            thread_data = {
                'user_id': user['id'],
                'title': prompt[:50] + "..." if len(prompt) > 50 else prompt,
                'is_saved': user['plan'] != 'hobby',
                'expires_at': calculate_expires_at(user['plan']).isoformat() if user['plan'] == 'hobby' else None
            }
            thread_response = supabase.table("threads").insert(thread_data).execute()
            thread_id = thread_response.data[0]['id']
        
        # Insert user message
        supabase.table("messages").insert({
            'thread_id': thread_id,
            'role': 'user',
            'content': prompt,
            'tokens_used': 0  # Cached, no cost
        }).execute()
        
        # Insert cached assistant response
        message_response = supabase.table("messages").insert({
            'thread_id': thread_id,
            'role': 'assistant',
            'content': cached_response.get('content', cached_response.get('message', {}).get('content', '')),
            'tokens_used': 0  # Cached, no cost
        }).execute()
        message = message_response.data[0]
        
        return GenerateResponse(
            thread_id=thread_id,
            message=message,
            tokens_remaining=user['tokens_remaining'],
            natural_language=f"Cached response (0 tokens used), {tokens_to_words(user['tokens_remaining'])} remaining"
        )
    
    # Check global Gemini limits before making API call
    check_gemini_limits(estimated_tokens)
    
    # Create or get thread
    if request.thread_id:
        thread_response = supabase.table("threads").select("*").eq("id", request.thread_id).single().execute()
        if not thread_response.data or thread_response.data['user_id'] != user['id']:
            raise HTTPException(status_code=404, detail="Thread not found")
        thread_id = request.thread_id
    else:
        thread_data = {
            'user_id': user['id'],
            'title': prompt[:50] + "..." if len(prompt) > 50 else prompt,
            'is_saved': user['plan'] != 'hobby',
            'expires_at': calculate_expires_at(user['plan']).isoformat() if user['plan'] == 'hobby' else None
        }
        thread_response = supabase.table("threads").insert(thread_data).execute()
        thread_id = thread_response.data[0]['id']
    
    # Insert user message
    supabase.table("messages").insert({
        'thread_id': thread_id,
        'role': 'user',
        'content': prompt,
        'tokens_used': estimated_tokens
    }).execute()
    
    try:
        # Generate code with AI
        code, input_tokens, output_tokens, total_tokens = await generate_pine_script(prompt, user)
        
        # Record actual usage for rate limiting
        record_gemini_usage(total_tokens)
        
        # Deduct tokens from user balance
        updated_user = await deduct_tokens(user['id'], total_tokens, thread_id, 'generate')
        
        # Insert assistant message
        assistant_message_data = {
            'thread_id': thread_id,
            'role': 'assistant',
            'content': code,
            'tokens_used': total_tokens,
            'input_tokens': input_tokens,
            'output_tokens': output_tokens
        }
        message_response = supabase.table("messages").insert(assistant_message_data).execute()
        message = message_response.data[0]
        
        # Update thread metadata
        supabase.table("threads").update({
            'total_tokens_used': supabase.table("threads").select("total_tokens_used").eq("id", thread_id).single().execute().data.get('total_tokens_used', 0) + total_tokens,
            'last_activity': datetime.now().isoformat()
        }).eq("id", thread_id).execute()
        
        # Cache the response for future identical prompts
        await cache_response(prompt, {
            'content': code,
            'tokens_used': total_tokens
        })
        
        return GenerateResponse(
            thread_id=thread_id,
            message=message,
            tokens_remaining=updated_user['tokens_remaining'],
            natural_language=f"{tokens_to_words(total_tokens)} used, {tokens_to_words(updated_user['tokens_remaining'])} remaining"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Generation error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "generation_failed",
                "message": "Failed to generate code. Please try again.",
                "details": str(e) if user.get('plan') in ['pro', 'business'] else None
            }
        )


@router.post("/explain", response_model=ExplainResponse)
async def explain_pine_script(
    request: ExplainRequest,
    user: Dict = Depends(get_current_user)
):
    """
    Explain Pine Script code in simple terms
    """
    # Check rate limit
    check_user_rate_limit(user['id'], user['plan'])
    
    # Estimate tokens
    estimated_tokens = estimate_tokens(request.code) + 500  # Buffer for response
    
    # Check token balance
    if not await check_token_balance(user, estimated_tokens):
        raise HTTPException(
            status_code=400,
            detail={
                "error": "insufficient_tokens",
                "message": f"Insufficient tokens. You have {user['tokens_remaining']} remaining.",
                "tokens_remaining": user['tokens_remaining']
            }
        )
    
    # Check global limits
    check_gemini_limits(estimated_tokens)
    
    try:
        # Get explanation from AI
        explanation, tokens_used = await explain_code(request.code)
        
        # Record usage
        record_gemini_usage(tokens_used)
        
        # Deduct tokens
        updated_user = await deduct_tokens(
            user['id'], 
            tokens_used, 
            request.thread_id, 
            'explain'
        )
        
        return ExplainResponse(
            explanation=explanation,
            tokens_used=tokens_used,
            tokens_remaining=updated_user['tokens_remaining']
        )
    
    except Exception as e:
        logger.error(f"Explain error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to explain code. Please try again.")


@router.post("/refine", response_model=RefineResponse)
async def refine_pine_script(
    request: RefineRequest,
    user: Dict = Depends(get_current_user)
):
    """
    Refine/modify existing Pine Script code based on instructions
    """
    supabase = get_supabase()
    
    # Check rate limit
    check_user_rate_limit(user['id'], user['plan'])
    
    # Sanitize instruction
    instruction = sanitize_prompt(request.instruction)
    
    # Estimate tokens
    estimated_tokens = estimate_tokens(request.code) + estimate_tokens(instruction) + 1000
    
    # Check token balance
    if not await check_token_balance(user, estimated_tokens):
        raise HTTPException(
            status_code=400,
            detail={
                "error": "insufficient_tokens",
                "message": f"Insufficient tokens. You have {user['tokens_remaining']} remaining.",
                "tokens_remaining": user['tokens_remaining']
            }
        )
    
    # Check global limits
    check_gemini_limits(estimated_tokens)
    
    try:
        # Refine code with AI
        refined_code, tokens_used = await refine_code(request.code, instruction)
        
        # Record usage
        record_gemini_usage(tokens_used)
        
        # Deduct tokens
        updated_user = await deduct_tokens(
            user['id'], 
            tokens_used, 
            request.thread_id, 
            'refine'
        )
        
        # If thread_id provided, save to thread
        thread_id = request.thread_id
        if thread_id:
            # Add refinement message to thread
            supabase.table("messages").insert({
                'thread_id': thread_id,
                'role': 'user',
                'content': f"[Refinement Request] {instruction}",
                'tokens_used': estimate_tokens(instruction)
            }).execute()
            
            supabase.table("messages").insert({
                'thread_id': thread_id,
                'role': 'assistant',
                'content': refined_code,
                'tokens_used': tokens_used
            }).execute()
        
        return RefineResponse(
            code=refined_code,
            tokens_used=tokens_used,
            tokens_remaining=updated_user['tokens_remaining'],
            thread_id=thread_id
        )
    
    except Exception as e:
        logger.error(f"Refine error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to refine code. Please try again.")


@router.post("/estimate")
async def estimate_generation_tokens(
    request: GenerateRequest,
    user: Dict = Depends(get_current_user)
):
    """
    Estimate tokens needed for a generation request
    """
    prompt = sanitize_prompt(request.prompt)
    estimated_input = estimate_tokens(prompt)
    estimated_output = estimated_input * 3  # Rough estimate: output is ~3x input
    estimated_total = estimated_input + estimated_output
    
    return {
        "estimated_input_tokens": estimated_input,
        "estimated_output_tokens": estimated_output,
        "estimated_total": estimated_total,
        "natural_language": tokens_to_words(estimated_total),
        "within_limit": estimated_input <= user['max_input_tokens'],
        "can_afford": estimated_total <= user['tokens_remaining'],
        "tokens_remaining": user['tokens_remaining']
    }
