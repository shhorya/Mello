# Mello: A Voice-First AI Agent for Early Mental Distress Check-ins and Referral for India's Informal Workforce

**Concept Note** | IBM SkillsBuild – AICTE – BharatCares (CSRBOX) Machine Learning & Applied AI Internship Program 2026

Submitted by: [Your Name], 3rd-year B.Tech CSE | SDG 3: Good Health and Well-being (Target 3.4)

## 1. Problem Statement

Millions of India's informal workers (delivery riders, domestic workers, construction and factory workers, small shopkeepers) live with long hours, unstable income, social isolation and no HR or employer wellness support. Stress, anxiety and low mood build up silently, and most of these workers never reach a counsellor until a crisis. Existing mental wellness apps assume a smartphone-fluent, English-reading, privacy-rich user. They do not fit this group.

This project proposes **Mello**, an AI-powered, voice-first, multilingual agent that runs short, friendly check-ins in the worker's own language, detects early signs of distress using validated screening questions plus language analysis, offers safe self-care guidance, and connects people to human help, including India's Tele-MANAS helpline (14416), before a crisis.

## 2. Why This Matters

- The National Mental Health Survey of India (2015-16, NIMHANS, about 34,800 adults across 12 states) found a treatment gap of about 80% for common mental disorders such as depression and anxiety, and estimated that roughly 150 million Indians need mental healthcare.
- The government has built a national front door: Tele-MANAS, a free 24x7 helpline (14416 or 1-800-891-4416) launched in October 2022, available in about 20 languages. The gap is **discovery and first contact**. Many people who would benefit never make the call.
- Informal workers face high stigma, low literacy and little privacy, so a text-heavy English app is the wrong interface. Voice in Hindi and regional languages matches how they already communicate.

Mello does not try to replace counsellors. It acts as a friendly, low-barrier bridge that notices early and points people to the human help that already exists.

## 3. Proposed Solution

**Mello** is a voice-first check-in companion with five capabilities:

1. **Weekly voice check-in:** a 3 to 5 minute conversation in the user's language (Hindi first, then Marathi, Tamil, Bengali and others), started by a phone call, a voice note or a simple web page.
2. **Gentle screening:** questions adapted from validated instruments (PHQ-9 for low mood, GAD-7 for anxiety), asked conversationally and scored consistently.
3. **Risk tiering:** Green (doing okay: tips and encouragement), Amber (persistent distress: guided coping plus a nudge to talk to someone), Red (possible crisis: immediate warm handoff to Tele-MANAS 14416 and a trusted contact).
4. **Grounded guidance:** short, culturally appropriate coping suggestions (breathing, sleep routine, talking to a friend) retrieved from a vetted knowledge base, never invented by the model.
5. **Aggregate insights for NGOs and CSR partners:** an anonymized dashboard of wellbeing trends by area or worker group, so organizations can plan camps, counsellors and interventions.

## 4. User Journey

1. Ravi, a delivery rider, gets a weekly voice prompt in Hindi at a time he chose.
2. He answers a few friendly questions about sleep, mood and worry by talking.
3. Speech is converted to text, and the screening agent scores his answers.
4. The safety agent checks for crisis language and decides the tier.
5. Ravi hears a short reply: encouragement and one practical tip (Green), or a suggestion to speak with a counsellor and a one-tap call to 14416 (Amber and Red).
6. Only anonymized trend data reaches the partner dashboard, and only with his consent.

## 5. AI Approach (Mapped to the IBM SkillsBuild Learning Plan)

| IBM SkillsBuild topic | How it is used in Mello |
|---|---|
| AI fundamentals | Supervised classification for risk tiering, NLP for text analysis, evaluation with precision and recall (recall matters most for crisis detection) |
| Generative AI | An open-source language model writes warm, simple replies in the user's language, constrained by strict safety rules and templates |
| RAG (Retrieval-Augmented Generation) | Guidance is retrieved from a curated knowledge base (vetted coping techniques, Tele-MANAS and local referral info), so answers are grounded and not hallucinated |
| Power of AI agents | The system uses tools: speech-to-text, scoring, knowledge retrieval, referral lookup and logging |
| Multi-agent systems | Specialist agents collaborate: Check-in Agent, Screening Agent, Safety and Triage Agent, Guidance (RAG) Agent, Referral Agent, Insights Agent |
| Agentic AI | The system plans each conversation, remembers earlier check-ins for trend detection, decides when to escalate, and always keeps a human in the loop for high-risk cases |

### Multi-agent flow

Check-in Agent (talks) → Screening Agent (scores PHQ-9 and GAD-7 style answers) → Safety and Triage Agent (keyword and model-based crisis detection, with a rule override that always escalates) → Guidance Agent (RAG over the vetted knowledge base) or Referral Agent (Tele-MANAS and local resources) → Insights Agent (anonymized aggregation for the dashboard).

### Safety-first design principle

The language model never decides risk alone. A transparent rule layer and validated screening scores set the tier, and any crisis phrase triggers escalation regardless of model output. Mello is a **screening and support tool, not a diagnostic or treatment tool**, and it says so to the user.

## 6. Responsible AI, Privacy and Ethics

- Explicit, voice-based consent in the user's language before any data is stored.
- Data minimization: transcripts are discarded after scoring unless the user opts in; the dashboard sees only anonymized aggregates.
- No diagnoses, no medication advice, no replacement for professional care, stated clearly at the start of every check-in.
- Human escalation path for every Red case, with Tele-MANAS as the default referral.
- Bias and language fairness testing across dialects, accents and genders, with human review of flagged conversations.
- Alignment with India's data protection expectations (consent, purpose limitation, minimal retention).

## 7. Technology Stack (All Free and Open Source)

- **Language and ML:** Python, scikit-learn for the risk classifier, pandas for data handling.
- **Speech:** the browser's built-in speech recognition for the demo; open-source Whisper for Hindi and regional speech-to-text in the full version.
- **Generative AI and RAG:** open-source models (via Hugging Face or locally with Ollama), a small vector store (FAISS or ChromaDB) over a curated knowledge base.
- **Agents:** a lightweight multi-agent orchestration written in Python (open-source agent frameworks such as LangGraph or CrewAI can be used).
- **Frontend:** a simple, large-button, voice-first web interface plus a clean partner dashboard.
- **Storage and hosting:** SQLite locally; free hosting tiers (GitHub Pages, Hugging Face Spaces) for demos.
- **Cost for the pilot:** zero. WhatsApp or IVR delivery is a later phase to be funded through an NGO or CSR partner.

## 8. Expected Impact

- **For workers:** an easy, stigma-free first step toward support, in their own language.
- **For NGOs and CSR partners:** early, anonymized visibility of wellbeing trends to target counselling camps and resources.
- **For the system:** more people reaching existing public services like Tele-MANAS, earlier.
- **SDG alignment:** SDG 3 (Target 3.4: promote mental health and well-being), with secondary links to SDG 8 (decent work) and SDG 10 (reduced inequalities).

### Success metrics

- Check-in completion rate and weekly retention
- Crisis-detection recall (target: very high; false negatives are the most serious failure)
- Share of Amber and Red users who accept a referral
- User-reported usefulness and comfort (simple voice rating)
- Language coverage and speech-recognition accuracy by language

## 9. Feasibility and Roadmap

| Phase | Timeline | Outcome |
|---|---|---|
| 1. Prototype | Weeks 1-3 | Working web demo: voice or text check-in, scoring, risk tiers, referral screen |
| 2. Intelligence | Weeks 4-6 | Risk classifier trained and evaluated, RAG knowledge base, multi-agent flow |
| 3. Languages | Weeks 7-8 | Hindi plus one regional language with Whisper-based speech-to-text |
| 4. Pilot readiness | Weeks 9-10 | Anonymized NGO dashboard, consent flow, review by a mental health professional |
| 5. Partner pilot | After internship | Small pilot with an NGO or CSR partner through WhatsApp or IVR |

## 10. Risks and Mitigations

- **Missed crisis:** rule-based escalation override, recall-first evaluation, human review of borderline cases.
- **Over-reliance on AI:** clear messaging that Mello is not a therapist; regular nudges to human contact.
- **Language and accent errors:** test across dialects; allow repeat or switch to keypad answers.
- **Privacy concerns:** minimal retention, consent, anonymized dashboards.
- **Clinical validity:** involve a qualified mental health professional to review questions, tiers and the knowledge base before any real-world use.

## 11. Conclusion

Mello turns the AI concepts from the IBM SkillsBuild learning plan (fundamentals, generative AI, RAG, agents, multi-agent systems and agentic AI) into a practical tool for a group that most apps overlook. It is low-cost, voice-first and safety-first, and it strengthens the human mental health services India already has instead of competing with them.

## Sources

- National Mental Health Survey of India, 2015-16 (NIMHANS), including the common mental disorders analysis (treatment gap about 80%).
- Tele-MANAS (Ministry of Health and Family Welfare): national tele-mental-health helpline 14416, launched October 2022, about 20 languages.
- PHQ-9 and GAD-7: standard, publicly available screening questionnaires (verify the validated Hindi and regional versions before use).
