# Architecture

## Pipeline
A shared `CheckIn` state object flows through six agents (`src/mello/agents.py`). Each agent reads and writes the state and appends a human-readable trace entry, which the UI shows under "What the agents did".

| Agent | File | Responsibility |
|---|---|---|
| Check-in | `agents.CheckInAgent`, `screening.py` | Validate language and answers; parse spoken answers (English, Hindi, Hinglish) |
| Screening | `agents.ScreeningAgent`, `screening.py` | PHQ-2 and GAD-2 scores, cut-off >= 3 gives Amber |
| Safety and Triage | `agents.SafetyTriageAgent`, `safety.py`, `classifier.py` | Crisis rules (always red) + ML text model; **can only escalate** |
| Guidance (RAG) | `agents.GuidanceAgent`, `rag.py`, `themes.py` | Themes from scores and text, then retrieve vetted tips |
| Referral | `agents.ReferralAgent` | Tele-MANAS for Amber and Red; adds 112 for Red |
| Insights | `agents.InsightsAgent`, `insights.py` | Anonymized (tier, themes) records with small-cell suppression |

After the agents, `generator.py` composes the reply from safe templates. An optional local LLM (Ollama) may rephrase it, but only if every required phone number survives; otherwise the template is used.

## Key design decisions
1. **Model can only escalate.** `RANK = green < amber < red`; `CheckIn.escalate` never lowers a tier. Tested in `tests/test_agents_insights.py`.
2. **Rules before models for crisis.** Rules are transparent and auditable and favour recall. The ML model adds a second signal but is not trusted alone.
3. **RAG over generation for advice.** Tips come only from `data/knowledge_base.json`. This avoids hallucinated health advice.
4. **Character n-grams.** TF-IDF over character n-grams handles Hindi, Hinglish spellings and typos without a tokenizer per language.
5. **Privacy by design.** Free text lives in memory only during a request; the database stores only date, language, tier and theme labels. Dashboard cells under k=5 are hidden.
6. **Zero-dependency server.** `server.py` uses the standard library, so deployment is trivial and free.

## Data flow
Browser (or CLI) -> `POST /api/checkin` -> pipeline -> JSON result (tier, scores, themes, reasons, tips, referral, reply, trace). `GET /api/insights` returns suppressed aggregates. Without a server, `frontend/index.html` runs equivalent JavaScript logic as an offline demo.

## Extending
- Better retrieval: replace `Retriever` internals with a multilingual embedding model plus FAISS or ChromaDB; keep `retrieve(query, lang, tags, k)`.
- Better text model: retrain with `python scripts/train_classifier.py --data your.csv`; consider fine-tuned multilingual transformers once you have real labelled data.
- Real speech: `speech.transcribe(path, lang)` (faster-whisper); add an upload endpoint.
- New language: add fields to `questions.json`, `knowledge_base.json`, templates in `generator.py`, rules in `safety.py`, and add the code to `config.LANGS`.
