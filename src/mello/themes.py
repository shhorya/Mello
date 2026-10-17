"""Theme extraction from screening scores and optional free text (drives RAG tags)."""
import re

THEME_PATTERNS = {
    "sleep": re.compile(r"sleep|tired|neend|thak|नींद|थक", re.I),
    "money": re.compile(r"money|salary|debt|paisa|paise|karz|कर्ज|पैसे|उधार", re.I),
    "family": re.compile(r"family|ghar|parivar|परिवार|घर", re.I),
    "work": re.compile(r"work|boss|shift|kaam|काम|मालिक", re.I),
    "lonely": re.compile(r"alone|lonely|akela|अकेल", re.I),
}


def extract_themes(scores, text=""):
    themes = []
    if scores["phq2"] >= 2:
        themes.append("mood")
    if scores["gad2"] >= 2:
        themes.append("anx")
    if scores["sleep"] >= 2:
        themes.append("sleep")
    for name, rx in THEME_PATTERNS.items():
        if text and rx.search(text) and name not in themes:
            themes.append(name)
    return themes
