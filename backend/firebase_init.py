import firebase_admin
from firebase_admin import credentials, firestore
import os
from pathlib import Path

current_dir = Path(__file__).parent

cred_path = current_dir / "firebase-service-account.json"

if not cred_path.exists():
    raise FileNotFoundError(
        f"Firebase credentials not found at {cred_path}\n"
        "Please download your service account key from Firebase Console:\n"
        "Project Settings → Service Accounts → Generate New Private Key\n"
        "Save it as: backend/firebase-service-account.json"
    )

if not firebase_admin._apps:
    cred = credentials.Certificate(str(cred_path))
    firebase_admin.initialize_app(cred)

db = firestore.client()