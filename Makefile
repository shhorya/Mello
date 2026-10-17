.PHONY: install train test run cli demo-data web-install web-dev web-build
install:
	pip install -r requirements.txt
train:
	python scripts/train_classifier.py
test:
	PYTHONPATH=src python -m unittest discover -s tests -v
run:
	PYTHONPATH=src python -m mello.server
cli:
	PYTHONPATH=src python -m mello.cli --lang en
demo-data:
	PYTHONPATH=src python scripts/seed_demo_data.py
web-install:
	cd web && pnpm install
web-dev:
	cd web && pnpm dev
web-build:
	cd web && pnpm build
