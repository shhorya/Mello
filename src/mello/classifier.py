"""ML risk classifier for free text: neutral / distress / crisis.

TF-IDF over character n-grams (robust to Hindi, Hinglish spellings and typos) + class-balanced
logistic regression. The bundled dataset is SYNTHETIC and tiny: it makes the pipeline runnable and
testable, not clinically meaningful. Replace it with consented, professionally labelled data
(see docs/DATASETS.md) before drawing any conclusion from the metrics.
"""
import csv
from pathlib import Path

import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.model_selection import StratifiedKFold, cross_val_predict
from sklearn.pipeline import make_pipeline

from .config import DATA_DIR, MODEL_PATH

LABELS = ["neutral", "distress", "crisis"]
SEED_DATASET = DATA_DIR / "seed_text_dataset.csv"


def load_dataset(path=SEED_DATASET):
    texts, labels = [], []
    with open(path, encoding="utf-8", newline="") as f:
        for row in csv.DictReader(f):
            texts.append(row["text"])
            labels.append(row["label"])
    return texts, labels


def build_pipeline():
    return make_pipeline(
        TfidfVectorizer(analyzer="char_wb", ngram_range=(2, 5), sublinear_tf=True, lowercase=True),
        LogisticRegression(max_iter=2000, C=5.0, class_weight="balanced", random_state=42),
    )


def train(path=SEED_DATASET, out=MODEL_PATH):
    X, y = load_dataset(path)
    pipe = build_pipeline().fit(X, y)
    if out:
        Path(out).parent.mkdir(parents=True, exist_ok=True)
        joblib.dump(pipe, out)
    return pipe


def evaluate(path=SEED_DATASET, folds=5):
    """Stratified k-fold cross-validation. Crisis RECALL is the headline metric."""
    X, y = load_dataset(path)
    cv = StratifiedKFold(n_splits=folds, shuffle=True, random_state=42)
    pred = cross_val_predict(build_pipeline(), X, y, cv=cv)
    report = classification_report(y, pred, labels=LABELS, output_dict=True, zero_division=0)
    # The deployed system is rules + model (either one triggers red). The rules were written by the
    # author while looking at this same dataset, so this combined figure is optimistic by construction.
    from .safety import crisis_rule_hits
    crisis_rows = [(t, p) for t, p, label in zip(X, pred, y) if label == "crisis"]
    combined = sum(1 for t, p in crisis_rows if p == "crisis" or crisis_rule_hits(t)) / len(crisis_rows)
    return {
        "n_samples": len(y),
        "folds": folds,
        "crisis_recall": report["crisis"]["recall"],
        "crisis_recall_with_rules_optimistic": combined,
        "report": report,
        "confusion_matrix": {"labels": LABELS, "matrix": confusion_matrix(y, pred, labels=LABELS).tolist()},
        "warning": "Synthetic seed data: these numbers only show the pipeline works. Model-only crisis recall is weak because the data is tiny. This is why the rule layer exists and why the model can only escalate.",
    }


class RiskClassifier:
    """Loads models/risk_classifier.joblib if present, otherwise trains in memory on the seed data."""

    def __init__(self, model_path=MODEL_PATH, dataset=SEED_DATASET):
        pipe = None
        if Path(model_path).exists():
            try:
                pipe = joblib.load(model_path)
            except Exception:  # stale or incompatible model file
                pipe = None
        self.pipe = pipe or train(dataset, out=None)

    def predict_proba(self, text):
        probs = self.pipe.predict_proba([str(text)])[0]
        return {label: float(p) for label, p in zip(self.pipe.classes_, probs)}
