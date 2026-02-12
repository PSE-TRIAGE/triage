FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Set PYTHONPATH so Python can find the modules
ENV PYTHONPATH=/app/src:/app

# Copy application code
COPY backend/src/ ./src/
COPY backend/algorithms/ ./algorithms/
COPY backend/utils/ ./utils/
COPY backend/pytest.ini .

# Copy over the license
COPY LICENSE /app/LICENSE

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]

