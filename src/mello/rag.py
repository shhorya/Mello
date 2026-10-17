"""Retrieval-Augmented Guidance: tips come ONLY from the vetted knowledge base, never invented.

Hybrid scoring = cosine similarity of char n-gram TF-IDF vectors (works across Hindi/English/Hinglish)
plus a boost for tag overlap with the detected themes. Swap in a multilingual embedding model later
without changing the interface (see docs/ARCHITECTURE.md).
"""
import json

from sklearn.feature_extraction.text import TfidfVectorizer

from .config import DATA_DIR

TAG_WEIGHT = 0.5


class Retriever:
    def __init__(self, kb_path=None):
        path = kb_path or DATA_DIR / "knowledge_base.json"
        with open(path, encoding="utf-8") as f:
            kb = json.load(f)
        self.entries, self.defaults, self.status = kb["entries"], kb["defaults"], kb["status"]
        docs = [" ".join(e["tags"]) + " " + e["en"]["title"] + " " + e["en"]["text"] + " " + e["hi"]["title"] + " " + e["hi"]["text"] for e in self.entries]
        self.vec = TfidfVectorizer(analyzer="char_wb", ngram_range=(2, 4), sublinear_tf=True)
        self.matrix = self.vec.fit_transform(docs)

    def retrieve(self, query="", lang="en", tags=(), k=2):
        sims = (self.matrix @ self.vec.transform([query]).T).toarray().ravel() if query and query.strip() else [0.0] * len(self.entries)
        ranked = sorted(
            ((float(sims[i]) + TAG_WEIGHT * len(set(e["tags"]) & set(tags)), i) for i, e in enumerate(self.entries)),
            reverse=True,
        )
        picks = [self.entries[i] for s, i in ranked[:k] if s > 0]
        if not picks:
            picks = [e for e in self.entries if e["id"] in self.defaults][:k]
        return [{"id": e["id"], "title": e[lang]["title"], "text": e[lang]["text"], "source": "vetted knowledge base (draft)"} for e in picks]
