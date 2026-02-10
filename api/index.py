import sys
import os
from pathlib import Path

# Add the backend directory to the path so imports work
backend_path = Path(__file__).parent.parent / "backend"
sys.path.append(str(backend_path))

# Import the app from backend.server
from server import app

# This is required for Vercel functions
handler = app
