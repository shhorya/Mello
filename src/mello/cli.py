"""Terminal check-in: python -m mello.cli --lang en"""
import argparse

from . import screening
from .agents import MelloPipeline
from .insights import InsightsStore


def main():
    ap = argparse.ArgumentParser(description="Mello terminal check-in")
    ap.add_argument("--lang", choices=["hi", "en"], default="en")
    ap.add_argument("--record", action="store_true", help="store an anonymized record for the dashboard")
    args = ap.parse_args()
    print("Mello is a screening and support tool, not a diagnosis or treatment.\n")
    q = screening.load_questions(args.lang)
    for i, o in enumerate(q["options"]):
        print(f"  {i} = {o}")
    answers = []
    for item in q["questions"]:
        while True:
            v = screening.parse_answer(input(f"\n{item['text']}\n> "))
            if v is not None:
                answers.append(v)
                break
            print("Please answer with 0-3 or words like 'never', 'several days', 'every day'.")
    free = input("\nAnything else you would like to share? (optional)\n> ")
    r = MelloPipeline(store=InsightsStore() if args.record else None).run(args.lang, answers, free, record=args.record)
    print(f"\n[{r['tier'].upper()}] {r['reply']['headline']}\n{r['reply']['body']}\n")
    for t in r["tips"]:
        print(f" - {t['title']}: {t['text']}")
    print("\nAgent trace:")
    for t in r["trace"]:
        print(f"  {t['agent']}: {t['detail']}")


if __name__ == "__main__":
    main()
