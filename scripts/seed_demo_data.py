"""Fill the dashboard with SYNTHETIC demo check-ins. Never present this as real data."""
import random
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))
from mello.insights import InsightsStore  # noqa: E402


def main(n=60):
    rnd = random.Random(7)
    store = InsightsStore()
    themes = ["sleep", "anx", "money", "mood", "work", "family", "lonely"]
    for _ in range(n):
        tier = rnd.choices(["green", "amber", "red"], weights=[60, 30, 10])[0]
        store.add(rnd.choice(["hi", "en"]), tier, rnd.sample(themes, rnd.randint(0, 3)))
    print(f"Inserted {n} synthetic demo check-ins")


if __name__ == "__main__":
    main()
