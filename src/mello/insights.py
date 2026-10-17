"""Anonymized aggregate store for NGO/CSR partners.

Stores ONLY (date, language, tier, themes). No names, phone numbers, IDs or transcripts. Aggregates apply
small-cell suppression: any category with fewer than K check-ins is hidden, and if the total is below K
nothing is shown at all.
"""
import sqlite3
import threading
from collections import Counter
from datetime import date

from .config import DB_PATH, K_ANONYMITY


class InsightsStore:
    def __init__(self, path=DB_PATH):
        if path != ":memory:":
            import os
            os.makedirs(os.path.dirname(str(path)), exist_ok=True)
        self._db = sqlite3.connect(str(path), check_same_thread=False)
        self._lock = threading.Lock()
        with self._lock:
            self._db.execute("CREATE TABLE IF NOT EXISTS checkins (day TEXT, lang TEXT, tier TEXT, themes TEXT)")
            self._db.commit()

    def add(self, lang, tier, themes, day=None):
        with self._lock:
            self._db.execute("INSERT INTO checkins VALUES (?,?,?,?)", (day or date.today().isoformat(), lang, tier, ",".join(themes)))
            self._db.commit()

    def aggregate(self, k=K_ANONYMITY):
        with self._lock:
            rows = self._db.execute("SELECT tier, themes FROM checkins").fetchall()
        total = len(rows)
        if total < k:
            return {"total": total, "suppressed": True, "tier": {}, "themes": {}}
        tiers = Counter(t for t, _ in rows)
        themes = Counter(x for _, th in rows for x in th.split(",") if x)
        return {
            "total": total,
            "suppressed": False,
            "tier": {c: n for c, n in tiers.items() if n >= k},
            "themes": {c: n for c, n in themes.items() if n >= k},
        }
