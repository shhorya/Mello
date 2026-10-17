"""Transparent rule layer for crisis language (English, Hindi, Hinglish).

Rules are deliberately simple and auditable. A match ALWAYS produces the red tier, regardless of
any model output. Rules favour recall: a false alarm costs a helpline suggestion; a miss can cost far more.
"""
import re
import unicodedata

_RAW = [
    r"\bsuicid\w*", r"\bkill(ing)? myself\b", r"\bend(ing)? (my life|it all)\b",
    r"\bwant(s)? to die\b", r"\bwanna die\b", r"\bno reason to live\b", r"\bnot worth living\b",
    r"\b(do not|don'?t|dont|no longer) want to live\b(?!\s+(in|near|with|here|there|at)\b)",
    r"\b(hurt|harm)(ing)? myself\b", r"better off without me",
    r"\bmar(na|ne)\s+chah\w*", r"\bmar jaun\b", r"\bmar jana\b", r"\bjee?na nahi\b", r"\bjina nahi\b",
    r"\bjeene ka (koi )?matlab nahi\b", r"\bkhud ko khatam\b", r"\bjaan (dena|de dunga|de dungi)\b",
    r"\bapni jaan\b", r"\bkhud ko nuksan\b", r"\batmahatya\b",
    r"मरना चाह", r"मर जाऊँ", r"मर जाना", r"जीना नहीं", r"जीने का (कोई )?मतलब नहीं",
    r"खुद को (खत्म|खतम)", r"जान दे", r"आत्महत्या", r"खुद को नुकसान", r"मेरे बिना सब बेहतर",
]
CRISIS_RULES = [re.compile(p, re.I) for p in _RAW]


def normalize(text):
    t = unicodedata.normalize("NFKC", str(text)).lower()
    return re.sub(r"\s+", " ", t.replace("\u2019", "'").replace("`", "'")).strip()


def crisis_rule_hits(text):
    """Return the regex patterns that matched (empty list means no crisis phrase found)."""
    t = normalize(text)
    return [rx.pattern for rx in CRISIS_RULES if rx.search(t)] if t else []
