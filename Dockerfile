# Use an official, lightweight Python base image
FROM python:3.11-slim

# Set environment variables
# Prevents Python from writing pyc files to disc
ENV PYTHONDONTWRITEBYTECODE=1
# Prevents Python from buffering stdout and stderr
ENV PYTHONUNBUFFERED=1
# Default port for deployment
ENV PORT=5001
ENV HOST=0.0.0.0

# Set working directory
WORKDIR /app

# Install system dependencies if required (e.g., standard font fallbacks)
RUN apt-get update && apt-get install -y --no-install-recommends \
    fonts-dejavu-core \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install python dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application files
COPY . /app/

# Ensure directories for dynamic runtime outputs exist
RUN mkdir -p /app/output /app/fonts

# Security Best Practice: Run as a non-root user to mitigate potential container escape exploits
RUN useradd -u 1000 -m appuser && chown -R appuser:appuser /app
USER appuser

# Expose the application port
EXPOSE 5001

# Run the app using Gunicorn WSGI server for production performance and stability
CMD gunicorn --bind 0.0.0.0:${PORT} --workers 4 --threads 2 app:app
