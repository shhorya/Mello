# Viva / interview Q&A

**Why does a rule layer decide risk and not the model?** A missed crisis is the worst failure. Rules are transparent, testable and favour recall. The model adds a second signal but can only escalate, never lower a tier.

**Your model's crisis recall is only 0.62. Is that a problem?** It is an honest result on 100 synthetic rows, which is why safety does not rely on the model. With real, professionally labelled data I would expect to improve it and I would report recall per language.

**Why not just use ChatGPT?** A general chatbot can hallucinate health advice, handles crisis inconsistently, needs internet and accounts, and is not designed for low-literacy voice use in Indian languages. Mello restricts advice to a vetted knowledge base and routes risk to humans.

**Why RAG?** To ground every tip in reviewed content so the system cannot invent advice.

**Why multi-agent?** Separation of duties: each agent has one job, a trace entry and its own tests, which makes decisions explainable and auditable.

**How does it handle privacy?** No identity or transcripts are stored; only date, language, tier and themes. Dashboard cells under 5 are hidden. A real deployment also needs a consent flow and security review.

**How does it fit with Tele-MANAS?** It does not compete. It is a low-barrier front door that brings more people to the existing national service.

**How would you handle dialect and accent bias?** Character n-grams tolerate spelling variants; I would test per language, accent and gender, and keep humans reviewing borderline cases.

**Is it a medical device?** No. It screens and refers; it does not diagnose or treat. It still needs clinical review before real use.

**What did you actually build versus plan?** Built: 6-agent pipeline, screening, rule layer, trained classifier, RAG retriever, anonymized insights, API server, frontend, 24 tests. Planned: validated instruments, real data, Whisper evaluation, WhatsApp/IVR, partner pilot.

**What would you do next?** Clinician review, real data collection with consent, more languages, a pilot with an NGO.
