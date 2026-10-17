"""PHQ-2 / GAD-2 style screening: question loading, answer parsing and scoring.

PHQ-2 (items 1-2) and GAD-2 (items 3-4) use the standard cut-off of >= 3 out of 6.
Item 5 (sleep/fatigue) is used only as a theme signal. This is screening, not diagnosis.
"""
import json
import re

from .config import DATA_DIR, LANGS

N_QUESTIONS = 5

_SPOKEN = [
    (3, r"every ?day|nearly|daily|always|roz|har din|रोज|हमेशा|लगभग"),
    (2, r"half|often|many|adhe|aksar|आधे|अक्सर|ज़्यादा|ज्यादा"),
    (1, r"several|few|some|kuch|kabhi kabhi|कुछ|कभी कभी|कभी-कभी"),
    (0, r"not at all|never|\bno\b|nahi|bilkul|नहीं|बिल्कुल"),
]


def load_questions(lang="en"):
    if lang not in LANGS:
        raise ValueError(f"unsupported language: {lang}")
    raw = json.loads((DATA_DIR / "questions.json").read_text(encoding="utf-8"))
    return {
        "options": raw["options"][lang],
        "questions": [{"id": q["id"], "domain": q["domain"], "text": q[lang]} for q in raw["questions"]],
    }


def parse_answer(text):
    """Map a typed or spoken answer ('roz', 'kuch din', 'never', '2') to 0..3, or None."""
    t = str(text).strip().lower()
    if t in {"0", "1", "2", "3"}:
        return int(t)
    for value, pattern in _SPOKEN:
        if re.search(pattern, t):
            return value
    return None


def coerce_answers(raw):
    """Accept ints or strings; return a validated list of 5 ints in 0..3."""
    if not isinstance(raw, (list, tuple)) or len(raw) != N_QUESTIONS:
        raise ValueError(f"answers must be a list of {N_QUESTIONS} items")
    out = []
    for item in raw:
        v = item if isinstance(item, int) and not isinstance(item, bool) else parse_answer(item)
        if v is None or not 0 <= v <= 3:
            raise ValueError(f"could not understand answer: {item!r}")
        out.append(v)
    return out


def score(answers):
    a = coerce_answers(answers)
    return {"phq2": a[0] + a[1], "gad2": a[2] + a[3], "sleep": a[4]}


def tier_from_scores(scores):
    return "amber" if scores["phq2"] >= 3 or scores["gad2"] >= 3 else "green"
