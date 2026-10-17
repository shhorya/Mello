# Deployment (free options)

Free tiers change often; check each provider's current terms.

## Local
```bash
pip install -r requirements.txt
python scripts/train_classifier.py
PYTHONPATH=src python -m mello.server --host 127.0.0.1 --port 8000
```

## Static demo on GitHub Pages
Pages serves only static files, so there is no Python backend. The page then runs in its built-in **offline demo mode** (same screening logic in JavaScript).
1. Copy `frontend/index.html` to `docs/index.html`.
2. In the repository, open Settings, then Pages, then choose branch `main` and folder `/docs`.

## Full app (Python backend)
Any free host that can run a Python process works (for example Render, Hugging Face Spaces with Docker, or PythonAnywhere). A `Dockerfile` is included (not tested in the authoring environment).
```bash
docker build -t mello .
docker run -p 8000:8000 mello
```
Notes: the SQLite file `data/insights.db` is ephemeral on many free hosts; do not rely on it for real data. Use HTTPS in any public deployment.

## Optional local LLM and speech
- Ollama (free, local) can rephrase replies via `generator.OllamaRewriter`; it is optional and guarded.
- `pip install faster-whisper` enables `speech.transcribe`.
