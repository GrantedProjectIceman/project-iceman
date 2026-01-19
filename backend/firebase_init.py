import firebase_admin
from firebase_admin import credentials, firestore
import os
from pathlib import Path
from dotenv import load_dotenv
import json

# Load environment variables from .env.local
current_dir = Path(__file__).parent
env_file = current_dir / ".env.local"
load_dotenv(env_file)

cred_path = current_dir / "firebase-service-account.json"

# Try to initialize from environment variables first, then fall back to file
if not firebase_admin._apps:
    try:
        # Check if we have environment variables
        if os.getenv("FIREBASE_PRIVATE_KEY"):
            firebase_config = {
                "type": "service_account",
                "project_id": os.getenv("FIREBASE_PROJECT_ID"),
                "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID"),
                "private_key": os.getenv("FIREBASE_PRIVATE_KEY").replace('\\n', '\n'),
                "client_email": os.getenv("FIREBASE_CLIENT_EMAIL"),
                "client_id": os.getenv("FIREBASE_CLIENT_ID"),
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            }
            cred = credentials.Certificate(firebase_config)
            firebase_admin.initialize_app(cred)
        elif cred_path.exists():
            cred = credentials.Certificate(str(cred_path))
            firebase_admin.initialize_app(cred)
        else:
            raise FileNotFoundError(
                f"Firebase credentials not found.\n"
                "Option 1: Set environment variables in backend/.env.local\n"
                "Option 2: Download service account key and save as backend/firebase-service-account.json\n"
                "Get key from Firebase Console: Project Settings → Service Accounts → Generate New Private Key"
            )
    except Exception as e:
        print(f"Firebase initialization error: {e}")
        raise

db = firestore.client()