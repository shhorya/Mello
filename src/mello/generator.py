"""Generative layer: warm, simple replies. Templates by default; optional local LLM rewrite.

Guardrail: an LLM may only REPHRASE a safe template. If its output drops any required phone number,
the template is used instead. The model never decides risk and never adds medical advice.
"""
import json
import urllib.request

TEMPLATES = {
    "hi": {
        "green": ("सब ठीक चल रहा है", "आपका ध्यान रखना अच्छा है। ये छोटे सुझाव मदद कर सकते हैं।"),
        "amber": ("थोड़ा बोझ दिख रहा है", "आप अकेले नहीं हैं। किसी से बात करना मदद करेगा। ये सुझाव आज़माइए।"),
        "red": ("अभी किसी इंसान से बात करें", "आपकी बात बहुत मायने रखती है। कृपया अभी Tele-MANAS पर कॉल करें। यह मुफ़्त है और 24x7 चलता है।"),
    },
    "en": {
        "green": ("You seem to be doing okay", "Looking after yourself matters. These small tips may help."),
        "amber": ("You seem to be carrying a lot", "You are not alone. Talking to someone can help. Try these tips."),
        "red": ("Please talk to a person now", "What you are feeling matters. Please call Tele-MANAS now. It is free and open 24x7."),
    },
}


def compose_reply(tier, lang, referral=None):
    headline, body = TEMPLATES[lang][tier]
    if referral:
        body += " " + " / ".join(referral["numbers"])
        if tier == "red":
            body += " (" + ("आपातकाल में 112" if lang == "hi" else "In immediate danger, call 112") + ")"
    return {"headline": headline, "body": body}


class OllamaRewriter:
    """Optional. Needs a local Ollama server (free, open-source): https://ollama.com . Not required."""

    def __init__(self, model="llama3.2", host="http://localhost:11434", timeout=20):
        self.model, self.host, self.timeout = model, host, timeout

    def rewrite(self, reply, lang, must_contain=()):
        language = "Hindi" if lang == "hi" else "English"
        prompt = (f"Rewrite this short message in simple, warm {language}. Keep every phone number exactly as written. "
                  f"Do not add medical advice or new claims. Message: {reply['body']}")
        try:
            req = urllib.request.Request(f"{self.host}/api/generate", data=json.dumps({"model": self.model, "prompt": prompt, "stream": False}).encode(), headers={"Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=self.timeout) as r:
                text = json.loads(r.read())["response"].strip()
        except Exception:
            return reply
        if not text or any(n not in text for n in must_contain):
            return reply
        return {"headline": reply["headline"], "body": text}
