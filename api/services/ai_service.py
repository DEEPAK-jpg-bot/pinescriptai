"""
AI Service - Gemini 2.0 Flash Integration
Handles code generation with context caching
"""
import google.generativeai as genai
import os
from typing import Dict, Tuple
from functools import lru_cache
from datetime import timedelta

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Load context file
@lru_cache(maxsize=1)
def load_context_file() -> str:
    """
    Load Pine Script context file (cached)
    """
    context_path = os.path.join(os.path.dirname(__file__), '../data/pine_script_context.txt')
    # Create empty context if not exists to avoid crash
    if not os.path.exists(context_path):
        return "You are a Pine Script assistant. Help the user write TradingView scripts."
    with open(context_path, 'r', encoding='utf-8') as f:
        return f.read()

# Create cached content (reused across requests)
@lru_cache(maxsize=1)
def get_cached_context():
    """
    Get cached Gemini context
    This significantly reduces costs
    """
    context = load_context_file()
    
    # Create cache (valid for 24 hours)
    cache = genai.caching.CachedContent.create(
        model='models/gemini-2.0-flash-001',
        system_instruction=context,
        ttl=timedelta(hours=24),
    )
    
    return cache

async def generate_pine_script(prompt: str, user: Dict) -> Tuple[str, int, int, int]:
    """
    Generate Pine Script code using Gemini 2.0 Flash
    
    Returns: (code, input_tokens, output_tokens, total_tokens)
    """
    try:
        # Get cached context
        cached_context = get_cached_context()
        
        # Create model with cached context
        model = genai.GenerativeModel.from_cached_content(cached_content=cached_context)
        
        # Generate content with sandboxing delimiters
        sanitized_prompt = f"---USER_PROMPT_START---\n{prompt}\n---USER_PROMPT_END---"
        
        response = model.generate_content(
            sanitized_prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.7,
                top_p=0.95,
                top_k=40,
                max_output_tokens=8192,
            )
        )
        
        # Extract token usage
        usage = response.usage_metadata
        input_tokens = usage.prompt_token_count
        output_tokens = usage.candidates_token_count
        total_tokens = input_tokens + output_tokens
        
        # Extract code from response
        code = response.text
        
        return code, input_tokens, output_tokens, total_tokens
    
    except Exception as e:
        # Handle API errors
        error_msg = str(e)
        
        if "quota" in error_msg.lower():
            raise Exception("API quota exceeded. Please try again later.")
        elif "rate" in error_msg.lower():
            raise Exception("Too many requests. Please wait a moment.")
        else:
            raise Exception(f"AI generation failed: {error_msg}")

async def explain_code(code: str) -> Tuple[str, int]:
    """
    Explain Pine Script code
    
    Returns: (explanation, tokens_used)
    """
    try:
        cached_context = get_cached_context()
        model = genai.GenerativeModel.from_cached_content(cached_content=cached_context)
        
        prompt = f"""Explain this Pine Script code in simple terms:

{code}

Provide:
1. What this code does (2-3 sentences)
2. Key components and their purpose
3. Entry/exit conditions (if strategy)
4. How to use it in TradingView"""
        
        response = model.generate_content(prompt)
        
        tokens_used = response.usage_metadata.total_token_count
        explanation = response.text
        
        return explanation, tokens_used
    
    except Exception as e:
        raise Exception(f"Code explanation failed: {str(e)}")

async def refine_code(code: str, instruction: str) -> Tuple[str, int]:
    """
    Refine existing Pine Script code
    
    Returns: (refined_code, tokens_used)
    """
    try:
        cached_context = get_cached_context()
        model = genai.GenerativeModel.from_cached_content(cached_content=cached_context)
        
        prompt = f"""Modify this Pine Script code according to the instruction:

CURRENT CODE:
{code}

INSTRUCTION:
{instruction}

Return only the modified Pine Script code with comments explaining changes."""
        
        response = model.generate_content(prompt)
        
        tokens_used = response.usage_metadata.total_token_count
        refined_code = response.text
        
        return refined_code, tokens_used
    
    except Exception as e:
        raise Exception(f"Code refinement failed: {str(e)}")
