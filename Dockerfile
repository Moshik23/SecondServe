# ================================================================================
# SECONDSERVE APPLICATION CONTAINER LAYERING BLUEPRINT
# LOCATION: STORE DIRECTLY IN AZURE DEVOPS REPOS (dev-containerization BRANCH)
# TARGET REGISTRY: acrsecondserve3226.azurecr.io
# ================================================================================

# Step 1: Base layer using official, lightweight Python slim footprint
FROM python:3.11-slim

# Step 2: Set environment variables for optimized execution in a container
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Step 3: Install base system dependencies needed for compiling data drivers
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    gnupg \
    build-essential \
    unixodbc-dev \
    && rm -rf /var/lib/apt/lists/*

# Step 4: Inject official Microsoft repository keys and get ODBC Driver 18 for SQL Server
RUN curl -fsSL https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor -o /usr/share/keyrings/microsoft-prod.gpg \
    && curl -fsSL https://packages.microsoft.com/config/debian/12/prod.list > /etc/apt/sources.list.yabs.d/mssql-release.list \
    || curl -fsSL https://packages.microsoft.com/config/debian/12/prod.list > /etc/apt/sources.list.d/mssql-release.list \
    && apt-get update \
    && ACCEPT_EULA=Y apt-get install -y --no-install-recommends msodbcsql18 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Step 5: Establish the internal runtime directory
WORKDIR /app

# Step 6: Isolate and cache dependency configurations
COPY requirements.txt .

# Step 7: Update pip and install the core application libraries
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Step 8: Transfer remaining source code maps 
COPY . .

# Step 9: Open standard application service port
EXPOSE 8000

# Step 10: Run high-performance production server on initialization
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]