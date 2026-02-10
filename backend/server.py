"""
Main FastAPI Application
Entry point for the backend API
"""
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from mangum import Mangum
from contextlib import asynccontextmanager
import os
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.DEBUG if os.getenv("ENVIRONMENT") == "development" else logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Import routers
from routes import auth, generate, threads, scripts, tokens, payments, user, affiliate


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan handler for startup and shutdown events
    """
    # Startup
    logger.info("Starting Pine Script AI Generator API")
    
    # Validate required environment variables
    required_vars = ["SUPABASE_URL", "SUPABASE_SERVICE_KEY", "SUPABASE_JWT_SECRET", "GEMINI_API_KEY"]
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        logger.error(f"Missing required environment variables: {missing_vars}")
        if os.getenv("ENVIRONMENT") == "production":
            raise RuntimeError(f"Missing required environment variables: {missing_vars}")
    
    # Log configuration status
    logger.info(f"Environment: {os.getenv('ENVIRONMENT', 'development')}")
    logger.info(f"Redis configured: {bool(os.getenv('UPSTASH_REDIS_URL'))}")
    logger.info(f"Stripe configured: {bool(os.getenv('STRIPE_SECRET_KEY'))}")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Pine Script AI Generator API")


# Initialize FastAPI app
app = FastAPI(
    title="Pine Script AI Generator API",
    description="AI-powered Pine Script code generation for TradingView",
    version="1.0.0",
    docs_url="/api/docs" if os.getenv("ENVIRONMENT") == "development" else None,
    redoc_url="/api/redoc" if os.getenv("ENVIRONMENT") == "development" else None,
    openapi_url="/api/openapi.json" if os.getenv("ENVIRONMENT") == "development" else None,
    lifespan=lifespan
)


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Handle uncaught exceptions gracefully
    """
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    
    # Don't expose internal errors in production
    if os.getenv("ENVIRONMENT") == "production":
        return JSONResponse(
            status_code=500,
            content={"detail": "An internal error occurred. Please try again later."}
        )
    
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)}
    )


# HTTP exception handler for better error responses
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """
    Format HTTP exceptions consistently
    """
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail,
            "status_code": exc.status_code
        }
    )


# CORS Configuration
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Add production frontend URL if configured
frontend_url = os.getenv("FRONTEND_URL", "")
if frontend_url and frontend_url not in allowed_origins:
    allowed_origins.append(frontend_url)

# Add Vercel preview URLs pattern
if os.getenv("ENVIRONMENT") == "production":
    allowed_origins.append("https://*.vercel.app")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID"],
)

# Gzip Compression for responses > 1KB
app.add_middleware(GZipMiddleware, minimum_size=1000)


# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(generate.router, prefix="/api", tags=["AI Generation"])
app.include_router(threads.router, prefix="/api/threads", tags=["Threads"])
app.include_router(scripts.router, prefix="/api/scripts", tags=["Scripts"])
app.include_router(tokens.router, prefix="/api/tokens", tags=["Tokens"])
app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])
app.include_router(user.router, prefix="/api/user", tags=["User"])
app.include_router(affiliate.router, prefix="/api/affiliate", tags=["Affiliate"])


# Health check endpoint
@app.get("/api/health", tags=["System"])
async def health_check():
    """
    Health check endpoint for monitoring and load balancers
    """
    return {
        "status": "healthy",
        "environment": os.getenv("ENVIRONMENT", "production"),
        "version": "1.0.0"
    }


# Root endpoint
@app.get("/api", tags=["System"])
async def root():
    """
    API root endpoint with basic information
    """
    return {
        "name": "Pine Script AI Generator API",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/api/docs" if os.getenv("ENVIRONMENT") == "development" else None
    }


# Vercel serverless handler
handler = Mangum(app, lifespan="off")
