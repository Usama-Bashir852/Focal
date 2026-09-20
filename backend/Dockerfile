FROM python:3.11-slim

WORKDIR /app

# No apt-get step needed here: every dependency below (including
# psycopg2-binary, which bundles its own libpq) ships a prebuilt wheel for
# this platform, so no system compiler is required. One less external host
# for the build to depend on.

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
