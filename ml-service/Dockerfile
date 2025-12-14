FROM python:3.11-slim

WORKDIR /app

# Copy requirements FIRST (cache optimization)
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Copy rest of the code
COPY . .

EXPOSE 8000

CMD ["python", "app/api.py"]
