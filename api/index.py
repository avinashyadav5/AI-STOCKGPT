import sys
import os

# Add the backend directory to Python path so all imports resolve
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

# Set the dotenv path to the backend .env file
os.environ.setdefault('DOTENV_PATH', os.path.join(os.path.dirname(__file__), '..', 'backend', '.env'))

from main import app
