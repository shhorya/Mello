# Mapping to the IBM SkillsBuild learning plan

| Topic | Where it appears in this repo |
|---|---|
| AI fundamentals | `classifier.py` (TF-IDF + logistic regression, cross-validation, recall-first evaluation), `screening.py` |
| Generative AI | `generator.py` (templated replies; optional local LLM rephrasing with a guardrail) |
| RAG | `rag.py` + `data/knowledge_base.json` (hybrid TF-IDF similarity and tag boost; advice only from vetted content) |
| Power of AI agents | Agents use tools: scoring, rule engine, classifier, retriever, referral lookup, anonymized store (`agents.py`) |
| Multi-agent systems | Six specialist agents with a shared state and an orchestrator (`MelloPipeline`) |
| Agentic AI | The pipeline plans the flow per check-in, applies escalation policy, keeps a human in the loop for risk, and records trends over time (`insights.py`) |

Suggested talking point: the agents are deliberately simple and auditable. The most important agentic decision (crisis escalation) is a rule with a human referral, not a free-running model.
