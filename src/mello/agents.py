"""The six specialist agents and the orchestrator.

Check-in -> Screening -> Safety & Triage -> Guidance (RAG) -> Referral -> Insights, followed by the
generative reply layer. Each agent reads and writes a shared CheckIn state and logs a human-readable
trace entry, so every decision is explainable (and shown in the UI).
"""
from dataclasses import dataclass, field

from . import safety, screening
from .classifier import RiskClassifier
from .config import CRISIS_PROB, DISTRESS_PROB, EMERGENCY_NUMBER, LANGS, TELE_MANAS
from .generator import compose_reply
from .insights import InsightsStore
from .rag import Retriever
from .themes import extract_themes

RANK = {"green": 0, "amber": 1, "red": 2}
MAX_TEXT = 1000


@dataclass
class CheckIn:
    lang: str
    answers: list
    free_text: str = ""
    scores: dict = field(default_factory=dict)
    themes: list = field(default_factory=list)
    tier: str = "green"
    reasons: list = field(default_factory=list)
    probs: dict = field(default_factory=dict)
    tips: list = field(default_factory=list)
    referral: dict = None
    reply: dict = None
    trace: list = field(default_factory=list)

    def log(self, agent, detail):
        self.trace.append({"agent": agent, "detail": detail})

    def escalate(self, tier, reason):
        if RANK[tier] > RANK[self.tier]:
            self.tier = tier
        self.reasons.append(reason)


class CheckInAgent:
    name = "Check-in Agent"

    def run(self, s):
        if s.lang not in LANGS:
            raise ValueError(f"unsupported language: {s.lang}")
        s.answers = screening.coerce_answers(s.answers)
        s.free_text = (s.free_text or "")[:MAX_TEXT]
        s.log(self.name, f"{len(s.answers)} questions answered in {'Hindi' if s.lang == 'hi' else 'English'}; free text held in memory only")


class ScreeningAgent:
    name = "Screening Agent"

    def run(self, s):
        s.scores = screening.score(s.answers)
        base = screening.tier_from_scores(s.scores)
        s.escalate(base, f"scores: PHQ-2={s.scores['phq2']}/6, GAD-2={s.scores['gad2']}/6 -> {base}")
        s.log(self.name, f"PHQ-2 {s.scores['phq2']}/6, GAD-2 {s.scores['gad2']}/6, sleep item {s.scores['sleep']}/3")


class SafetyTriageAgent:
    name = "Safety and Triage Agent"

    def __init__(self, classifier):
        self.classifier = classifier

    def run(self, s):
        hits = safety.crisis_rule_hits(s.free_text)
        if hits:
            s.escalate("red", "rule: crisis phrase found")
            s.log(self.name, "Crisis phrase found: rule override to RED (model cannot lower this)")
        if s.free_text.strip():
            s.probs = self.classifier.predict_proba(s.free_text)
            if s.probs.get("crisis", 0) >= CRISIS_PROB:
                s.escalate("red", f"model: crisis probability {s.probs['crisis']:.2f}")
            elif s.probs.get("distress", 0) >= DISTRESS_PROB:
                s.escalate("amber", f"model: distress probability {s.probs['distress']:.2f}")
            s.log(self.name, "Text model probabilities: " + ", ".join(f"{k} {v:.2f}" for k, v in s.probs.items()))
        if not hits and not s.free_text.strip():
            s.log(self.name, "No free text; tier set by scores only")
        s.log(self.name, f"Final tier: {s.tier.upper()}")


class GuidanceAgent:
    name = "Guidance Agent (RAG)"

    def __init__(self, retriever):
        self.retriever = retriever

    def run(self, s):
        s.themes = extract_themes(s.scores, s.free_text)
        s.tips = self.retriever.retrieve(s.free_text, s.lang, s.themes, k=2)
        s.log(self.name, f"Themes: {', '.join(s.themes) or 'none'}. Retrieved {', '.join(t['id'] for t in s.tips)} from the vetted knowledge base")


class ReferralAgent:
    name = "Referral Agent"

    def run(self, s):
        if s.tier == "green":
            s.log(self.name, "Not needed this week")
            return
        s.referral = dict(TELE_MANAS, numbers=list(TELE_MANAS["numbers"]))
        if s.tier == "red":
            s.referral["emergency"] = EMERGENCY_NUMBER
        s.log(self.name, "Tele-MANAS " + " / ".join(s.referral["numbers"]) + (f" and {EMERGENCY_NUMBER} for immediate danger" if s.tier == "red" else ""))


class InsightsAgent:
    name = "Insights Agent"

    def __init__(self, store):
        self.store = store

    def run(self, s, record=True):
        if record and self.store is not None:
            self.store.add(s.lang, s.tier, s.themes)
            s.log(self.name, "Anonymized record stored (tier and themes only; no text, no identity)")
        else:
            s.log(self.name, "Recording disabled for this run")


class MelloPipeline:
    def __init__(self, classifier=None, retriever=None, store=None, rewriter=None):
        self.checkin = CheckInAgent()
        self.screening = ScreeningAgent()
        self.safety = SafetyTriageAgent(classifier or RiskClassifier())
        self.guidance = GuidanceAgent(retriever or Retriever())
        self.referral = ReferralAgent()
        self.insights = InsightsAgent(store)
        self.rewriter = rewriter

    def run(self, lang, answers, free_text="", record=True):
        s = CheckIn(lang=lang, answers=answers, free_text=free_text)
        for agent in (self.checkin, self.screening, self.safety, self.guidance, self.referral):
            agent.run(s)
        s.reply = compose_reply(s.tier, s.lang, s.referral)
        if self.rewriter and s.referral:
            s.reply = self.rewriter.rewrite(s.reply, s.lang, must_contain=s.referral["numbers"])
        s.log("Reply composer (generative layer)", "Template reply" + (" (optionally rephrased by a local LLM)" if self.rewriter else ""))
        self.insights.run(s, record=record)
        return {
            "tier": s.tier, "scores": s.scores, "themes": s.themes, "reasons": s.reasons, "probs": s.probs,
            "tips": s.tips, "referral": s.referral, "reply": s.reply, "trace": s.trace,
            "disclaimer": "Screening and support tool, not a diagnosis or treatment.",
        }
