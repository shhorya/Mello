import unittest
import _path  # noqa: F401
from mello import screening


class ScreeningTests(unittest.TestCase):
    def test_scores_and_tiers(self):
        s = screening.score([0, 0, 0, 0, 3])
        self.assertEqual(screening.tier_from_scores(s), "green")
        self.assertEqual(screening.tier_from_scores(screening.score([2, 1, 0, 0, 0])), "amber")  # PHQ-2 = 3
        self.assertEqual(screening.tier_from_scores(screening.score([0, 0, 1, 2, 0])), "amber")  # GAD-2 = 3
        self.assertEqual(screening.tier_from_scores(screening.score([1, 1, 1, 1, 0])), "green")  # 2 and 2

    def test_parse_answer_english_hindi_hinglish(self):
        cases = {"never": 0, "not at all": 0, "several days": 1, "more than half the days": 2, "nearly every day": 3,
                 "roz": 3, "kuch din": 1, "nahi": 0, "रोज़": 3, "कुछ दिन": 1, "बिल्कुल नहीं": 0, "2": 2}
        for text, want in cases.items():
            self.assertEqual(screening.parse_answer(text), want, text)
        self.assertIsNone(screening.parse_answer("purple elephant"))

    def test_validation(self):
        for bad in ([1, 2, 3], [0, 0, 0, 0, 9], "abc", [0, 0, 0, 0, "gibberish"], [True, 0, 0, 0, 0]):
            with self.assertRaises(ValueError):
                screening.coerce_answers(bad)

    def test_questions_in_both_languages(self):
        for lang in ("en", "hi"):
            q = screening.load_questions(lang)
            self.assertEqual(len(q["questions"]), 5)
            self.assertEqual(len(q["options"]), 4)
        with self.assertRaises(ValueError):
            screening.load_questions("fr")


if __name__ == "__main__":
    unittest.main()
