import unittest
import _path  # noqa: F401
from mello.classifier import RiskClassifier, evaluate
from mello.rag import Retriever


class ClassifierTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.clf = RiskClassifier(model_path="/nonexistent/model.joblib")  # forces in-memory training

    def test_probabilities_sum_to_one(self):
        p = self.clf.predict_proba("I feel tired")
        self.assertAlmostEqual(sum(p.values()), 1.0, places=5)
        self.assertEqual(set(p), {"neutral", "distress", "crisis"})

    def test_obvious_examples(self):
        self.assertEqual(max((v, k) for k, v in self.clf.predict_proba("I want to die").items())[1], "crisis")
        self.assertEqual(max((v, k) for k, v in self.clf.predict_proba("आज काम अच्छा रहा और मैं ठीक हूँ").items())[1], "neutral")

    def test_evaluate_reports_crisis_recall(self):
        r = evaluate(folds=5)
        self.assertIn("crisis_recall", r)
        self.assertTrue(0.0 <= r["crisis_recall"] <= 1.0)
        # Model alone is weak on 100 synthetic rows; rules + model must do at least as well.
        self.assertGreaterEqual(r["crisis_recall_with_rules_optimistic"], r["crisis_recall"])
        self.assertGreaterEqual(r["crisis_recall_with_rules_optimistic"], 0.9)


class RetrieverTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.r = Retriever()

    def test_theme_tags_drive_results(self):
        ids = [t["id"] for t in self.r.retrieve("", "en", ["sleep"], k=2)]
        self.assertIn("K2", ids)
        self.assertIn("K5", [t["id"] for t in self.r.retrieve("", "en", ["money"], k=1)])

    def test_language_and_defaults(self):
        hi = self.r.retrieve("", "hi", ["sleep"], k=1)[0]
        self.assertTrue(any("\u0900" <= c <= "\u097f" for c in hi["text"]))
        self.assertEqual([t["id"] for t in self.r.retrieve("", "en", [], k=2)], ["K1", "K3"])  # defaults


if __name__ == "__main__":
    unittest.main()
