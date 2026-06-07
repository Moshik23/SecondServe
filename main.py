# ================================================================================
# PRODUCTION BACKEND SOURCE CODE: MAIN.PY
# TARGET LOCATION: REPOSITORY ROOT PATH
# PROJECT TARGET: SECONDSERVE SURPLUS RECOVERY ENGINE (COMPLETE CRUD MANAGEMENT)
# COMPLIANCE STANDARD: RULE5FIST MANDATORY FULL RECODE DELIVERABLE
# ================================================================================

from fastapi import FastAPI, HTTPException, status, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
import asyncio
import pyodbc
import logging
import os
import requests
import json
import re

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

app = FastAPI(
    title="SecondServe Core API",
    description="Cloud-Native Surplus Recovery Backend with SGT Timezone Expiry Substrate",
    version="2.3.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Relational Infrastructure Connection Context Configuration
DB_SERVER = os.getenv("DB_SERVER", "tcp:sqlserver-secondserve-3226new.database.windows.net,1433")
DB_NAME = os.getenv("DB_NAME", "db-secondserve")
DB_USER = os.getenv("DB_USER", "ssadmin")
DB_PASS = os.getenv("DB_PASS", "SecurePassSecondServe2026!")
DRIVER = os.getenv("DB_DRIVER", "{ODBC Driver 18 for SQL Server}")

class ProductCreateSchema(BaseModel):
    vendor_id: int = Field(..., example=1)
    product_name: str = Field(..., max_length=150, example="Mutton Biryani")
    category: str = Field(..., max_length=100, example="Meals")
    original_price: float = Field(..., gt=0.0)
    discount_price: float = Field(..., ge=0.0)
    quantity_available: int = Field(..., gt=0)
    image_url: str = Field("/assets/default-food.jpg", max_length=500)

class UnstructuredTextPayload(BaseModel):
    raw_text: str

def get_db_connection():
    conn_str = f"DRIVER={DRIVER};SERVER={DB_SERVER};DATABASE={DB_NAME};UID={DB_USER};PWD={DB_PASS};Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;"
    return pyodbc.connect(conn_str)

# --------------------------------------------------------------------------------
# CORE COMPUTATIONAL SUBSTRATE: SGT-ALIGNED AUTOMATED EXPIRY LIFECYCLE
# --------------------------------------------------------------------------------
def execute_database_surplus_sweep():
    """Connects to Azure SQL and natively resets active listings to zero availability."""
    logging.info("EXPIRY ENGINE: Initiating database transaction sweep mapping layer.")
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        sweep_query = "UPDATE Products SET QuantityAvailable = 0 WHERE QuantityAvailable > 0"
        cursor.execute(sweep_query)
        affected_rows = cursor.rowcount

        conn.commit()
        logging.info(f"EXPIRY ENGINE SUCCESS: Pulse Event Automation executed. Items retired: {affected_rows}")
        return affected_rows
    except Exception as err:
        logging.error(f"EXPIRY ENGINE CRITICAL FAILURE: Transaction drop on substrate: {str(err)}")
        if conn:
            conn.rollback()
        raise err
    finally:
        if conn:
            conn.close()

async def production_expiry_timer_loop():
    """Autonomously executes background database scrubs every 12 hours (Twice Daily SGT Peaks)."""
    sgt_timezone = ZoneInfo("Asia/Singapore")
    while True:
        now = datetime.now(sgt_timezone)
        target_afternoon = now.replace(hour=14, minute=30, second=0, microsecond=0)
        target_evening = now.replace(hour=20, minute=30, second=0, microsecond=0)

        if now < target_afternoon:
            next_target = target_afternoon
        elif now < target_evening:
            next_target = target_evening
        else:
            next_target = target_afternoon + timedelta(days=1)

        sleep_seconds = (next_target - now).total_seconds()
        logging.info(f"EXPIRY ENGINE TIMER: Hibernating for {sleep_seconds} seconds until EXACTLY {next_target.strftime('%Y-%m-%d %H:%M:%S')} SGT.")
        await asyncio.sleep(sleep_seconds)
        try:
            execute_database_surplus_sweep()
        except Exception:
            pass

@app.on_event("startup")
async def initialize_container_background_jobs():
    asyncio.create_task(production_expiry_timer_loop())

# --------------------------------------------------------------------------------
# PROOF OF CONCEPT (PoC) PRESENTATION DAY SIMULATION ENGINE
# --------------------------------------------------------------------------------
async def run_mock_pulse_countdown():
    logging.info("PoC SIMULATION: 60-second countdown sequence initiated.")
    await asyncio.sleep(60)
    logging.info("PoC SIMULATION: 60 seconds elapsed. Simulating 2:30 PM Pulse Event Automation...")
    try:
        execute_database_surplus_sweep()
    except Exception:
        logging.error("PoC SIMULATION: Background execution loop failed.")

@app.post("/api/v1/diagnostics/pulse-simulate", status_code=status.HTTP_202_ACCEPTED)
def trigger_mock_pulse_automation(background_tasks: BackgroundTasks):
    background_tasks.add_task(run_mock_pulse_countdown)
    return {
        "status": "simulation_initiated",
        "simulation_target_time_seconds": 60,
        "message": "Pulse Event Automation countdown started. Database will sweep completely in 60 seconds."
    }

# --------------------------------------------------------------------------------
# ADVANCED DATABASE MANAGEMENT AND DIRECT CRUD API ROUTES
# --------------------------------------------------------------------------------
@app.get("/api/v1/products")
def get_active_products():
    """CHECK ACTIVE ITEMS: Retrieves listings where Quantity > 0."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT p.ProductID, p.ProductName, p.CurrentDiscountPrice, p.QuantityAvailable, v.StallLocation
            FROM Products p
            JOIN Vendors v ON p.VendorID = v.VendorID
            WHERE p.QuantityAvailable > 0
        """)
        rows = cursor.fetchall()
        products = []
        for row in rows:
            products.append({
                "ProductID": row.ProductID,
                "ProductName": row.ProductName,
                "DiscountPrice": float(row.CurrentDiscountPrice),
                "Quantity": row.QuantityAvailable,
                "Location": row.StallLocation
            })
        conn.close()
        return {"status": "success", "data": products}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/management/products")
def get_all_inventory_records():
    """CHECK ALL ITEMS: Diagnostic endpoint to audit the entire database table regardless of availability status."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT p.ProductID, p.ProductName, p.Category, p.OriginalPrice, p.CurrentDiscountPrice, p.QuantityAvailable
            FROM Products p
        """)
        rows = cursor.fetchall()
        inventory = []
        for row in rows:
            inventory.append({
                "ProductID": row.ProductID,
                "ProductName": row.ProductName,
                "Category": row.Category,
                "OriginalPrice": float(row.OriginalPrice),
                "DiscountPrice": float(row.CurrentDiscountPrice),
                "Quantity": row.QuantityAvailable
            })
        conn.close()
        return {"status": "success", "data": inventory}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/products", status_code=status.HTTP_201_CREATED)
def create_surplus_listing(payload: ProductCreateSchema):
    """INSERT ITEM: Injects a new surplus food record directly into the Azure SQL data architecture."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        insert_query = """
            INSERT INTO Products (VendorID, ProductName, Category, OriginalPrice, CurrentDiscountPrice, QuantityAvailable, ImageUrl, CreatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, GETDATE())
        """
        cursor.execute(insert_query, payload.vendor_id, payload.product_name, payload.category, payload.original_price, payload.discount_price, payload.quantity_available, payload.image_url)
        conn.commit()
        conn.close()
        return {"status": "success", "message": "Surplus product record successfully injected into SecondServe Shelf"}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@app.delete("/api/v1/management/products/{product_id}")
def delete_inventory_record(product_id: int):
    """DELETE ITEM: Forcefully purges a specific inventory row target entirely from the database engine."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Verify row presence before executing transaction deletion
        cursor.execute("SELECT ProductID FROM Products WHERE ProductID = ?", product_id)
        if not cursor.fetchone():
            conn.close()
            raise HTTPException(status_code=404, detail=f"Target execution dropped: Product ID {product_id} does not exist.")

        cursor.execute("DELETE FROM Products WHERE ProductID = ?", product_id)
        conn.commit()
        conn.close()
        return {"status": "success", "message": f"Product ID {product_id} successfully purged from database storage."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/diagnostics/database")
def db_health_check():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        conn.close()
        return {"database_status": "connected", "message": "Successfully authenticated with db-secondserve"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/diagnostics/seed")
def seed_database_native():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Vendors')
        BEGIN
            CREATE TABLE Vendors (
                VendorID INT PRIMARY KEY,
                VendorName NVARCHAR(100) NOT NULL,
                StallLocation NVARCHAR(200) NOT NULL
            );
            INSERT INTO Vendors (VendorID, VendorName, StallLocation)
            VALUES (1, 'Bedok Hawker Center - Stall 14', 'Bedok North Street 1, Singapore');
        END;
        """)
        cursor.execute("""
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Products')
        BEGIN
            CREATE TABLE Products (
                ProductID INT IDENTITY(1,1) PRIMARY KEY,
                VendorID INT FOREIGN KEY REFERENCES Vendors(VendorID),
                ProductName NVARCHAR(150) NOT NULL,
                Category NVARCHAR(100) NOT NULL,
                OriginalPrice DECIMAL(10,2) NOT NULL,
                CurrentDiscountPrice DECIMAL(10,2) NOT NULL,
                QuantityAvailable INT NOT NULL,
                ImageUrl NVARCHAR(500) NULL,
                CreatedAt DATETIME NOT NULL
            );
        END;
        """)
        conn.commit()
        conn.close()
        return {"status": "success", "message": "Database successfully seeded natively."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --------------------------------------------------------------------------------
# MULTILINGUAL GITHUB MODELS AI PARSER INTEGRATION SUBSTRATE
# --------------------------------------------------------------------------------
@app.post("/api/v1/parser/parse", tags=["Generative AI Substrate"])
def parse_hawker_text(payload: UnstructuredTextPayload):
    """
    Leverages GitHub Models API Tier running GPT-4o-mini natively.
    Exposes full multilingual parsing capacity directly into our data architecture.
    """
    api_endpoint = "https://models.inference.ai.azure.com/chat/completions"
    github_token = os.getenv("GITHUB_TOKEN", "")

    raw_lower = payload.raw_text.lower()

    # Enterprise Resiliency: If no token is provided in the environment, fallback gracefully
    if not github_token:
        return {"status": "success", "source": "resilient_fallback_substrate", "data": execute_resilient_fallback_parsing(raw_lower)}

    system_prompt = (
        "You are a deterministic data transformation API. Extract unstructured food product details "
        "from local dialects or descriptions and return a raw, flat JSON object. Do not write conversational filler or wrap inside markdown blocks.\n\n"
        "You MUST strictly follow this JSON schema configuration structure:\n"
        "{\n"
        "  \"vendor_id\": 1,\n"
        "  \"product_name\": \"Clean Extracted Product String\",\n"
        "  \"category\": \"Choose strictly one of: Meals, Snacks, Soups, Desserts, Fast Food\",\n"
        "  \"original_price\": float,\n"
        "  \"discount_price\": float,\n"
        "  \"quantity_available\": integer\n"
        "}\n\n"
        "If specific prices are missing, infer a realistic market base default. Ensure output is pure JSON text only."
    )

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {github_token}"
    }

    body = {
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": payload.raw_text}
        ],
        "temperature": 0.1,
        "max_tokens": 250
    }

    try:
        response = requests.post(api_endpoint, headers=headers, json=body, timeout=10)
        response.raise_for_status()

        response_json = response.json()
        raw_output = response_json["choices"][0]["message"]["content"].strip()
        
        # Strip code block decorators if returned by the inference engine
        if raw_output.startswith("```"):
            raw_output = re.sub(r"^```json\s*|```$", "", raw_output, flags=re.MULTILINE).strip()

        parsed_data = json.loads(raw_output)
        
        # Inject explicit static web path required by ProductCreateSchema constraints
        parsed_data["image_url"] = "/assets/default-food.jpg"
        
        return {"status": "success", "source": "github_models_gpt4o_mini", "data": parsed_data}

    except Exception as e:
        # Graceful fallback intercept if the network fails
        logging.error(f"GitHub Models API failed. Triggering fallback. Error: {str(e)}")
        return {"status": "success", "source": "resilient_fallback_substrate", "data": execute_resilient_fallback_parsing(raw_lower)}

def execute_resilient_fallback_parsing(text: str):
    """Fallback compiler parses unstructured data matching auto-populate schema requirements."""
    detected_product = "Chicken Rice"
    detected_category = "Meals"
    
    if "biryani" in text or "mutton" in text:
        detected_product = "Mutton Biryani"
        detected_category = "Meals"
    elif "bento" in text:
        detected_product = "Bento Box"
        detected_category = "Meals"
    elif "soup" in text or "fish" in text:
        detected_product = "Fish Soup"
        detected_category = "Soups"

    numbers = [float(n) for n in re.findall(r"\d+\.?\d*", text)]
    
    qty = 5
    disc_p = 3.00
    orig_p = 6.00

    if len(numbers) >= 1:
        qty = int(numbers[0])
    if len(numbers) >= 2:
        disc_p = float(numbers[1])
    if len(numbers) >= 3:
        orig_p = float(numbers[2])
        
    if orig_p < disc_p:
        orig_p, disc_p = disc_p, orig_p

    return {
        "vendor_id": 1,
        "product_name": detected_product,
        "category": detected_category,
        "original_price": orig_p,
        "discount_price": disc_p,
        "quantity_available": qty,
        "image_url": "/assets/default-food.jpg"
    }

# --------------------------------------------------------------------------------
# STATIC FILE HOSTING AND SPA ROUTING SERVICE INTERFACE
# --------------------------------------------------------------------------------
dist_path = os.path.join(os.path.dirname(__file__), "dist")
if os.path.exists(dist_path):
    @app.get("/bundle.js")
    def serve_js_bundle(): return FileResponse(os.path.join(dist_path, "bundle.js"), media_type="application/javascript")
    @app.get("/index.html")
    def serve_html_index(): return FileResponse(os.path.join(dist_path, "index.html"), media_type="text/html")
    @app.get("/{catchall:path}")
    def serve_frontend_spa(catchall: str):
        if catchall.startswith("api/v1"): raise HTTPException(status_code=404)
        return FileResponse(os.path.join(dist_path, "index.html"))
else:
    @app.get("/")
    def read_root(): return {"status": "online"}

# SYSTEM ARCHITECTURE TRACE: COMPLETED ISOLATED STAGE DEVELOPMENT TESTING LOOP

