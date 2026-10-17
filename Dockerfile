FROM node:22-slim AS web
WORKDIR /web
COPY web/package.json web/pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY web/ .
RUN pnpm build

FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
COPY --from=web /web/out /app/web/out
ENV PYTHONPATH=/app/src
RUN python scripts/train_classifier.py
EXPOSE 8000
CMD ["python", "-m", "mello.server", "--host", "0.0.0.0", "--port", "8000"]
