# Use official lean Python runtime environment substrate (Debian 12 Bookworm)
FROM python:3.11-slim

# Enforce immediate log flushing to capture serverless outputs instantly
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system utilities and Microsoft official repository keys for Linux pyodbc compilation
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    g++ \
    unixodbc-dev \
    && curl -fsSL https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor -o /usr/share/keyrings/microsoft-prod.gpg \
    && curl -fsSL https://packages.microsoft.com/config/debian/12/prod.list > /etc/apt/sources.list.d/mssql-release.list \
    && apt-get update \
    && ACCEPT_EULA=Y apt-get install -y msodbcsql18 \
    && rm -rf /var/lib/apt/lists/*

# Copy configuration matrices over to the container engine root folder
COPY package.json webpack.config.js .babelrc ./
COPY public/ ./public
COPY src/ ./src

# Install Node and run Webpack compilation layers natively inside build execution
RUN apt-get update && apt-get install -y nodejs npm \
    && npm install \
    && npm run build \
    && rm -rf node_modules

# Copy primary Python configurations over to the operational path
COPY requirements.txt main.py ./
RUN pip install --no-cache-dir -r requirements.txt

# Integrate serverless function background trigger application files
COPY expiry_engine/ ./expiry_engine/
RUN pip install --no-cache-dir -r expiry_engine/requirements.txt

EXPOSE 8000

# Fire up the high-availability Uvicorn engine matrix to launch our full-stack web shell
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
