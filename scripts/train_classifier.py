"""Train the text risk classifier and write models/risk_classifier.joblib + models/metrics.json.

Usage: python scripts/train_classifier.py [--data path/to/dataset.csv]
CSV columns: text,label,lang   (label in neutral | distress | crisis)
"""
import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))
from mello import classifier  # noqa: E402
from mello.config import MODEL_DIR  # noqa: E402


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", default=str(classifier.SEED_DATASET))
    args = ap.parse_args()
    metrics = classifier.evaluate(args.data)
    classifier.train(args.data)
    MODEL_DIR.mkdir(exist_ok=True)
    (MODEL_DIR / "metrics.json").write_text(json.dumps(metrics, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Trained on {metrics['n_samples']} samples. Crisis recall (5-fold CV): {metrics['crisis_recall']:.2f}")
    print("Confusion matrix", metrics["confusion_matrix"])
    print("NOTE:", metrics["warning"])


if __name__ == "__main__":
    main()
