# Multi-stage build for smaller final image
FROM python:3.11-slim AS base

# Ensure stdout/stderr are unbuffered for logs
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# System deps for psycopg2 and build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Workdir
WORKDIR /app

# Copy requirements first for better caching
COPY API/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy API source
COPY API/ /app/API/

# Expose port expected by EasyPanel
EXPOSE 5000

# Default envs (override in EasyPanel)
ENV SECRET_KEY="change-me" \
    JWT_SECRET="" \
    MAIL_SERVER="" \
    MAIL_PORT=587 \
    MAIL_USE_TLS=true \
    MAIL_USE_SSL=false \
    MAIL_USERNAME="" \
    MAIL_PASSWORD="" \
    MAIL_DEFAULT_SENDER=""

# Start with Gunicorn (Flask app located at API/app.py -> app)
# -k gthread for simple concurrency, tunable via WEB_CONCURRENCY and THREADS
ENV WEB_CONCURRENCY=2 \
    THREADS=4 \
    GUNICORN_CMD_ARGS="--timeout 60 --graceful-timeout 30 --access-logfile - --error-logfile -"

CMD gunicorn -w ${WEB_CONCURRENCY} -k gthread --threads ${THREADS} -b 0.0.0.0:5000 API.app:app
