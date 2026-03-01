FROM python:3.11-slim
WORKDIR /app
# Force cache bust: 2026-03-01-v2
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
ENV PORT=3000
CMD gunicorn --bind 0.0.0.0:$PORT app:app
