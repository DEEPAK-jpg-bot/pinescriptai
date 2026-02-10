import sys
import os
from pathlib import Path

# Add the root and backend directory to the path so imports work
root_path = Path(__file__).parent.parent
sys.path.append(str(root_path))
sys.path.append(str(root_path / "backend"))

# Import the app from backend.server
from server import app

# This is required for Vercel functions
handler = app
