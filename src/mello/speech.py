"""Optional speech-to-text with open-source Whisper (faster-whisper). Free, runs locally.

Install with: pip install faster-whisper   (not needed for the core app or tests)
Hindi and regional-language accuracy MUST be measured on real worker speech before relying on it.
"""
from functools import lru_cache


@lru_cache(maxsize=2)
def _model(size):
    try:
        from faster_whisper import WhisperModel
    except ImportError as exc:
        raise RuntimeError("Speech-to-text needs the optional package: pip install faster-whisper") from exc
    return WhisperModel(size, compute_type="int8")


def transcribe(audio_path, lang="hi", model_size="small"):
    segments, _ = _model(model_size).transcribe(audio_path, language=lang, vad_filter=True)
    return " ".join(seg.text.strip() for seg in segments).strip()
