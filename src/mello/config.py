"""Central configuration. Override the project root with MANNMITRA_HOME."""
import os
from pathlib import Path

ROOT = Path(os.environ.get("MANNMITRA_HOME", Path(__file__).resolve().parents[2]))
DATA_DIR = ROOT / "data"
MODEL_DIR = ROOT / "models"
_WEB_OUT = ROOT / "web" / "out"
FRONTEND_DIR = _WEB_OUT if (_WEB_OUT / "index.html").is_file() else ROOT / "frontend"
DB_PATH = DATA_DIR / "insights.db"
MODEL_PATH = MODEL_DIR / "risk_classifier.joblib"

LANGS = ("hi", "en")

# Verified public numbers (Ministry of Health and Family Welfare, Tele-MANAS; national emergency number).
TELE_MANAS = {"name": "Tele-MANAS", "numbers": ["14416", "1-800-891-4416"], "hours": "24x7", "languages": "about 20"}
EMERGENCY_NUMBER = "112"

# The model may only ESCALATE a tier, never lower it (see agents.SafetyTriageAgent).
CRISIS_PROB = 0.60
DISTRESS_PROB = 0.60

# Dashboard cells with fewer check-ins than this are hidden (small-cell suppression).
K_ANONYMITY = 5
