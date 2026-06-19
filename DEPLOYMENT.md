# Certificate Generator - Deployment Guide

This document describes how to build, run, and deploy the Certificate Generator Web UI in a production-ready environment.

---

## 1. Environment Configurations

The application supports configuration via environment variables:

| Variable | Default Value | Description |
|---|---|---|
| `PORT` | `5001` | The port the web server binds to. |
| `HOST` | `127.0.0.1` | The address the server listens on. Set to `0.0.0.0` for Docker/production. |
| `FLASK_DEBUG` | `false` | Enable/disable Flask debug mode. Keep `false` in production. |

---

## 2. Option A: Containerized Deployment (Recommended)

Using Docker ensures consistency across environments (Linux servers, Cloud providers, and local machines).

### Prerequisites
Make sure you have [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) installed.

### Build the Docker Image
```bash
docker build -t cert-generator-app .
```

### Run the Container Directly
Run the container in detached mode, binding to host port `5001`, and mounting the local `output/` directory so you can retrieve generated certificates:
```bash
docker run -d \
  -p 5001:5001 \
  -v $(pwd)/output:/app/output \
  -v $(pwd)/fonts:/app/fonts \
  --name cert-generator \
  cert-generator-app
```

### Run Using Docker Compose
Alternatively, launch the container using Docker Compose, which automatically mounts the volumes and configures environmental variables:
```bash
docker-compose up -d
```
Stop the container:
```bash
docker-compose down
```

---

## 3. Option B: Bare-Metal / Virtual Private Server (Gunicorn)

To run the application on a Unix-based production host without Docker, use the **Gunicorn WSGI server** instead of Flask's built-in Werkzeug development server.

### 1. Install dependencies
```bash
pip install -r requirements.txt
```

### 2. Start Gunicorn
Run Gunicorn pointing to `app:app` (the `app` instance inside `app.py`). Bind it to all interfaces on port `5001`:
```bash
gunicorn --bind 0.0.0.0:5001 --workers 4 --threads 2 app:app
```

---

## 4. Option C: Deploying to Cloud Providers

### Render / Railway / Fly.io
1. Connect your GitHub repository containing this codebase.
2. Select **Web Service / Python** environment.
3. Configure the **Build Command**:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure the **Start Command**:
   ```bash
   gunicorn --bind 0.0.0.0:$PORT app:app
   ```
5. Set environment variables:
   - `PORT`: (Set automatically by platforms, otherwise e.g. `8080` or `5000`)
   - `HOST`: `0.0.0.0`
   - `FLASK_DEBUG`: `false`

### Heroku
The repo contains the requirements and `app.py`. To specify Gunicorn startup parameters, you can add a `Procfile` in the project root:
```txt
web: gunicorn --bind 0.0.0.0:$PORT app:app
```
