import json
import threading
import unittest
import urllib.error
import urllib.request

import _path  # noqa: F401
from mello.agents import MelloPipeline
from mello.classifier import RiskClassifier
from mello.insights import InsightsStore
from mello.server import make_server


class ServerTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        store = InsightsStore(":memory:")
        cls.srv = make_server("127.0.0.1", 0, MelloPipeline(classifier=RiskClassifier("/nonexistent"), store=store), store)
        cls.base = f"http://127.0.0.1:{cls.srv.server_address[1]}"
        threading.Thread(target=cls.srv.serve_forever, daemon=True).start()

    @classmethod
    def tearDownClass(cls):
        cls.srv.shutdown()
        cls.srv.server_close()

    def get(self, path):
        with urllib.request.urlopen(self.base + path) as r:
            return r.status, r.read()

    def post(self, payload):
        req = urllib.request.Request(self.base + "/api/checkin", data=json.dumps(payload).encode(), headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read())

    def test_health_and_questions(self):
        self.assertEqual(json.loads(self.get("/api/health")[1])["status"], "ok")
        self.assertEqual(len(json.loads(self.get("/api/questions?lang=hi")[1])["questions"]), 5)

    def test_checkin_roundtrip(self):
        r = self.post({"lang": "en", "answers": [0, 0, 0, 0, 0], "free_text": "I want to die"})
        self.assertEqual(r["tier"], "red")
        r = self.post({"lang": "hi", "answers": ["roz", "kuch din", "never", "never", "never"]})
        self.assertEqual(r["tier"], "amber")

    def test_bad_requests(self):
        with self.assertRaises(urllib.error.HTTPError) as c:
            self.post({"lang": "en", "answers": [1]})
        self.assertEqual(c.exception.code, 400)
        with self.assertRaises(urllib.error.HTTPError) as c:
            self.get("/../../etc/passwd")
        self.assertEqual(c.exception.code, 404)

    def test_frontend_is_served(self):
        status, body = self.get("/")
        self.assertEqual(status, 200)
        self.assertIn(b"Mello", body)


if __name__ == "__main__":
    unittest.main()
