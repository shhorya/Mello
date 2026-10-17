import unittest
import _path  # noqa: F401
from mello.agents import MelloPipeline
from mello.classifier import RiskClassifier
from mello.insights import InsightsStore

CLF = RiskClassifier(model_path="/nonexistent/model.joblib")


class PipelineTests(unittest.TestCase):
    def setUp(self):
        self.store = InsightsStore(":memory:")
        self.p = MelloPipeline(classifier=CLF, store=self.store)

    def test_green_has_no_referral(self):
        r = self.p.run("en", [0, 0, 0, 0, 0], "")
        self.assertEqual(r["tier"], "green")
        self.assertIsNone(r["referral"])

    def test_amber_offers_tele_manas(self):
        r = self.p.run("hi", [2, 1, 0, 0, 2], "")
        self.assertEqual(r["tier"], "amber")
        self.assertIn("14416", r["referral"]["numbers"])
        self.assertTrue(r["tips"])

    def test_crisis_text_always_red_even_with_perfect_scores(self):
        for text in ["I want to die", "main marna chahta hoon", "मुझे जीना नहीं है"]:
            r = self.p.run("en", [0, 0, 0, 0, 0], text)
            self.assertEqual(r["tier"], "red", text)
            self.assertEqual(r["referral"]["emergency"], "112")

    def test_model_never_lowers_a_tier(self):
        r = self.p.run("en", [3, 3, 3, 3, 3], "I slept well and work was fine today")
        self.assertEqual(r["tier"], "amber")

    def test_trace_covers_every_agent(self):
        agents = {t["agent"] for t in self.p.run("en", [1, 1, 1, 1, 1], "tired")["trace"]}
        for name in ("Check-in Agent", "Screening Agent", "Safety and Triage Agent", "Guidance Agent (RAG)", "Referral Agent", "Insights Agent"):
            self.assertIn(name, agents)

    def test_rejects_bad_input(self):
        with self.assertRaises(ValueError):
            self.p.run("fr", [0, 0, 0, 0, 0])
        with self.assertRaises(ValueError):
            self.p.run("en", [0, 0])

    def test_record_flag(self):
        self.p.run("en", [0, 0, 0, 0, 0], record=False)
        self.assertEqual(self.store.aggregate(k=1)["total"], 0)


class InsightsTests(unittest.TestCase):
    def test_small_totals_are_suppressed(self):
        s = InsightsStore(":memory:")
        for _ in range(3):
            s.add("en", "green", [])
        self.assertTrue(s.aggregate(k=5)["suppressed"])

    def test_small_cells_are_hidden(self):
        s = InsightsStore(":memory:")
        for _ in range(8):
            s.add("en", "green", ["sleep"])
        for _ in range(2):
            s.add("en", "red", ["money"])
        a = s.aggregate(k=5)
        self.assertEqual(a["tier"], {"green": 8})
        self.assertNotIn("red", a["tier"])
        self.assertNotIn("money", a["themes"])


if __name__ == "__main__":
    unittest.main()
