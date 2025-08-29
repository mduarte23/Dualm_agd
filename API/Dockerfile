# API-only Dockerfile (build context should be the API directory)
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# System deps for psycopg2
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy API source (context is API/)
COPY . /app/

EXPOSE 5000

# Defaults (override via EasyPanel)
ENV SECRET_KEY="change-me" \
    JWT_SECRET="" \
    MAIL_SERVER="" \
    MAIL_PORT=587 \
    MAIL_USE_TLS=true \
    MAIL_USE_SSL=false \
    MAIL_USERNAME="" \
    MAIL_PASSWORD="" \
    MAIL_DEFAULT_SENDER=""

# Gunicorn settings
ENV WEB_CONCURRENCY=2 \
    THREADS=4 \
    GUNICORN_CMD_ARGS="--timeout 60 --graceful-timeout 30 --access-logfile - --error-logfile -"

# app.py exposes `app`
CMD gunicorn -w ${WEB_CONCURRENCY} -k gthread --threads ${THREADS} -b 0.0.0.0:5000 app:app
