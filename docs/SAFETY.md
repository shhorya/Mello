# Safety, privacy and responsible AI

Mello deals with a sensitive topic. This document states what the system does, what it must never do, and what is still missing.

## Principles
1. **Not a diagnosis or treatment.** Every screen and reply says so.
2. **Humans first for risk.** Any crisis phrase gives Red, which always shows Tele-MANAS (14416, 1-800-891-4416) and 112 for immediate danger.
3. **Fail safe.** Rules favour recall; the model can only raise the tier. A false alarm costs a helpline suggestion; a miss may cost far more.
4. **No invented advice.** Tips are retrieved from a vetted knowledge base only.
5. **Data minimization.** No names, phone numbers, IDs or transcripts are stored. Dashboard aggregates hide any cell under 5 check-ins.
6. **Consent.** A real deployment must obtain explicit consent (in the user's language) before any check-in data is recorded.

## What the system must never do
- Diagnose a condition, suggest medication or give treatment advice.
- Describe methods of self-harm or respond to crisis language with anything other than an immediate human referral.
- Share individual-level data with partners or employers.
- Be used on real people before the checklist below is complete.

## Before real-world use (checklist)
- [ ] Qualified mental health professional reviews the questions, tiers, rules, tips and referral flow
- [ ] Validated Hindi and regional versions of PHQ-9 / GAD-7 replace the adapted wording
- [ ] Consent flow, retention policy and secure storage reviewed against India's data protection law
- [ ] Crisis-detection recall measured on real, consented, professionally labelled data in each supported language
- [ ] Speech recognition accuracy measured on real worker speech, dialects and noisy audio
- [ ] Human counsellor on call behind every escalation path during any pilot; NGO partner agreement
- [ ] Incident process: what happens if a user in crisis does not call, who reviews borderline cases

## Known risks
| Risk | Mitigation today | Still needed |
|---|---|---|
| Missed crisis | Rules + model; model cannot de-escalate | Clinical review; real-data evaluation; more languages |
| False alarms | Phrase rules avoid common benign uses ("dying to see", "killing me") | Tune with real data |
| Over-reliance on AI | Clear disclaimers; referral to humans | User research |
| Privacy | Minimal storage; k-anonymity | Consent flow; security review |
| Bias across dialects | Char n-grams are tolerant | Fairness testing by language, accent, gender |
