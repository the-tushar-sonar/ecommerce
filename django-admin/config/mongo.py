import os
from pathlib import Path

from dotenv import load_dotenv
from pymongo import MongoClient

# Reuse the existing backend environment without copying secrets.
PROJECT_ROOT = Path(__file__).resolve().parents[2]
SERVER_ENV = PROJECT_ROOT / "server" / ".env"

load_dotenv(SERVER_ENV)

MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    raise RuntimeError(
        f"MONGO_URI was not found in {SERVER_ENV}"
    )

client = MongoClient(
    MONGO_URI,
    serverSelectionTimeoutMS=5000,
)

db = client["ecommerce"]
