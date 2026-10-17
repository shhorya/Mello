# Datasets

## What is bundled
`data/seed_text_dataset.csv`: 100 short, hand-written, **synthetic** sentences (English, Hindi, Hinglish) labelled `neutral`, `distress` or `crisis`. It exists only to make training, evaluation and tests runnable. The crisis rows are short ideation statements with no method details.

## Replacing it with real data
1. Collect data with informed consent and ethical approval from your institution; never scrape private messages.
2. Have a qualified professional label it (neutral / distress / crisis) with a written guideline.
3. Keep the same CSV columns: `text,label,lang`.
4. Run `python scripts/train_classifier.py --data your.csv` and read `models/metrics.json`. Report crisis **recall** and per-language results, not just accuracy.

## Public starting points (check licences and suitability yourself)
- Dreaddit: English Reddit stress-detection dataset (useful for stress signal, not Indian languages).
- GoEmotions: English emotion-labelled comments (general emotion, not clinical).
These do not cover Hindi, Hinglish or other Indian languages and are not a substitute for locally collected, consented data.
