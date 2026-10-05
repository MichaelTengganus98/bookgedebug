FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Collect static files at build time (served by WhiteNoise).
RUN SECRET_KEY=build-only python manage.py collectstatic --noinput

RUN useradd --create-home appuser && chown -R appuser /app

COPY --chmod=755 docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

USER appuser

EXPOSE 8000
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["sh", "-c", "gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers 2"]
