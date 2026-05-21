# WeasyPrint needs Cairo, Pango, and GDK-PixBuf system libraries,
# which are easiest to provide via a Debian-based Python image on Render.
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

# System dependencies for WeasyPrint (Cairo / Pango / GDK-PixBuf / fonts).
RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential \
        libcairo2 \
        libpango-1.0-0 \
        libpangoft2-1.0-0 \
        libgdk-pixbuf-2.0-0 \
        libffi-dev \
        shared-mime-info \
        fonts-dejavu \
        fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt ./
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY . .

# Persisted writeable paths used by the app at runtime.
RUN mkdir -p storage/exports

EXPOSE 8000

# Render injects $PORT; bind uvicorn to it.
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
