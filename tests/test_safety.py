import unittest
import _path  # noqa: F401
from mello.safety import crisis_rule_hits


class SafetyRuleTests(unittest.TestCase):
    def test_detects_crisis_phrases(self):
        for text in ["I want to die", "I don\u2019t want to live anymore", "thinking about suicide", "I will kill myself",
                     "everyone would be better off without me", "main marna chahta hoon", "mujhe jeena nahi hai",
                     "main khud ko khatam kar lunga", "मैं मरना चाहता हूँ", "मुझे जीना नहीं है", "आत्महत्या के ख्याल आते हैं"]:
            self.assertTrue(crisis_rule_hits(text), text)

    def test_no_false_alarm_on_everyday_speech(self):
        for text in ["I am dying to see my family", "this heat is killing me", "I don't want to live in this city",
                     "bahut thaka hoon", "आज काम अच्छा रहा", "", "   "]:
            self.assertEqual(crisis_rule_hits(text), [], text)


if __name__ == "__main__":
    unittest.main()
