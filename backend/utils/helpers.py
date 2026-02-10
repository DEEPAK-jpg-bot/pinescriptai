"""
Helper utility functions
"""
from datetime import datetime, timedelta
import hashlib
import re
import html
from typing import Optional


def tokens_to_words(tokens: int) -> str:
    """
    Convert tokens to approximate word count for display
    1 token ≈ 0.75 words
    """
    if tokens < 0:
        return "0 words"
    
    words = int(tokens * 0.75)
    
    if words >= 1_000_000:
        return f"~{words / 1_000_000:.1f}M words"
    elif words >= 1_000:
        return f"~{words / 1_000:.1f}k words"
    else:
        return f"~{words} words"


def estimate_tokens(text: str) -> int:
    """
    Estimate token count from text
    Uses a more accurate estimation based on GPT tokenization patterns
    """
    if not text:
        return 0
    
    # Base estimation: ~4 characters per token for English
    char_estimate = len(text) // 4
    
    # Adjust for code (more tokens per character)
    code_indicators = ['def ', 'function', 'class ', 'import ', '//@version', 'indicator(', 'strategy(']
    if any(indicator in text for indicator in code_indicators):
        char_estimate = int(char_estimate * 1.2)
    
    # Adjust for whitespace-heavy text (fewer tokens)
    whitespace_ratio = len(re.findall(r'\s', text)) / max(len(text), 1)
    if whitespace_ratio > 0.2:
        char_estimate = int(char_estimate * 0.9)
    
    return max(1, char_estimate)


def format_number(num: int) -> str:
    """
    Format number with commas for display
    1000 -> 1,000
    """
    return f"{num:,}"


def calculate_expires_at(plan: str) -> Optional[datetime]:
    """
    Calculate thread expiration time based on plan
    """
    if plan == "hobby":
        return datetime.utcnow() + timedelta(hours=24)
    return None  # No expiration for paid plans


def hash_prompt(prompt: str) -> str:
    """
    Create a secure hash of prompt for caching
    Uses SHA-256 for better security than MD5
    """
    normalized = prompt.lower().strip()
    return hashlib.sha256(normalized.encode('utf-8')).hexdigest()[:32]


def sanitize_prompt(prompt: str) -> str:
    """
    Sanitize user prompt to prevent prompt injection attacks
    
    This provides defense-in-depth against:
    - Direct injection attempts
    - System prompt manipulation
    - Role confusion attacks
    - HTML/script injection
    """
    if not prompt:
        return ""
    
    # HTML escape to prevent any HTML injection
    sanitized = html.escape(prompt)
    
    # Comprehensive list of injection patterns (kept as fallback)
    injection_patterns = [
        # Direct instruction override attempts
        r'ignore\s+(all\s+)?(previous|above|prior)\s+(instructions?|prompts?|rules?)',
        r'disregard\s+(all\s+)?(previous|above|prior)',
        r'forget\s+(all\s+)?(previous|above|prior)',
        r'override\s+(all\s+)?(previous|above|prior)',
        r'skip\s+(all\s+)?(previous|above|prior)',
        
        # System/role manipulation
        r'system\s*:\s*',
        r'assistant\s*:\s*',
        r'human\s*:\s*',
        r'user\s*:\s*',
        r'\[INST\]',
        r'\[/INST\]',
        r'<<SYS>>',
        r'<</SYS>>',
        
        # New: Sandboxing protection (preventing user from closing our delimiters)
        r'---USER_PROMPT_START---',
        r'---USER_PROMPT_END---',
        r'===SYSTEM_RESERVED===',
    ]
    
    for pattern in injection_patterns:
        sanitized = re.sub(pattern, '[REDACTED]', sanitized, flags=re.IGNORECASE)
    
    # Remove excessive newlines (but keep reasonable formatting)
    sanitized = re.sub(r'\n{4,}', '\n\n\n', sanitized)
    
    # Remove null bytes and other problematic characters
    sanitized = sanitized.replace('\x00', '')
    
    # Limit length to prevent token stuffing
    max_length = 10000
    if len(sanitized) > max_length:
        sanitized = sanitized[:max_length]
    
    return sanitized.strip()


def sanitize_code(code: str) -> str:
    """
    Sanitize Pine Script code (less aggressive than prompt sanitization)
    """
    if not code:
        return ""
    
    # Only remove truly dangerous patterns, preserve code structure
    dangerous_code_patterns = [
        r'<script[^>]*>.*?</script>',
        r'javascript\s*:',
    ]
    
    sanitized = code
    for pattern in dangerous_code_patterns:
        sanitized = re.sub(pattern, '', sanitized, flags=re.IGNORECASE | re.DOTALL)
    
    return sanitized.strip()


def validate_email(email: str) -> bool:
    """
    Validate email format
    """
    if not email or len(email) > 254:
        return False
    
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def get_days_until_reset(billing_cycle_start: datetime) -> int:
    """
    Calculate days until next billing cycle
    """
    if not billing_cycle_start:
        return 30
    
    now = datetime.utcnow()
    
    # Handle string dates
    if isinstance(billing_cycle_start, str):
        try:
            billing_cycle_start = datetime.fromisoformat(billing_cycle_start.replace('Z', '+00:00').replace('+00:00', ''))
        except ValueError:
            return 30
    
    # Calculate next cycle (30 days from last cycle start)
    next_cycle = billing_cycle_start + timedelta(days=30)
    
    # If next cycle is in the past, find the next upcoming one
    while next_cycle < now:
        next_cycle += timedelta(days=30)
    
    return max(0, (next_cycle - now).days)


def truncate_text(text: str, max_length: int = 100, suffix: str = "...") -> str:
    """
    Truncate text to specified length with suffix
    """
    if not text or len(text) <= max_length:
        return text or ""
    
    return text[:max_length - len(suffix)] + suffix


def extract_pine_script(content: str) -> str:
    """
    Extract Pine Script code from AI response
    Handles markdown code blocks and raw code
    """
    if not content:
        return ""
    
    # Try to extract from markdown code block first
    code_block_pattern = r'```(?:pinescript|pine)?\s*\n?([\s\S]*?)```'
    match = re.search(code_block_pattern, content, re.IGNORECASE)
    
    if match:
        return match.group(1).strip()
    
    # Look for Pine Script version declaration
    version_pattern = r'(//@version=\d+[\s\S]*)'
    match = re.search(version_pattern, content)
    
    if match:
        return match.group(1).strip()
    
    # Return original content if no pattern matches
    return content.strip()


def format_token_usage(tokens_used: int, tokens_remaining: int) -> dict:
    """
    Format token usage for API responses
    """
    return {
        "tokens_used": tokens_used,
        "tokens_remaining": tokens_remaining,
        "tokens_used_display": tokens_to_words(tokens_used),
        "tokens_remaining_display": tokens_to_words(tokens_remaining)
    }
