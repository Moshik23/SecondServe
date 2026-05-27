from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pyodbc

app = FastAPI(
    title="SecondServe Core API",
    description="Cloud-Native Surplus Recovery Backend integrating Azure SQL",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection parameters derived directly from Phase 1 Infrastructure Runbook
DB_SERVER = "tcp:sqlserver-secondserve-3226.database.windows.net,1433"
DB_NAME = "db-secondserve"
DB_USER = "ssadmin"
DB_PASS = "SecurePassSecondServe2026!"
DRIVER = "{ODBC Driver 18 for SQL Server}"

def get_db_connection():
    conn_str = f"DRIVER={DRIVER};SERVER={DB_SERVER};DATABASE={DB_NAME};UID={DB_USER};PWD={DB_PASS};Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;"
    return pyodbc.connect(conn_str)

@app.get("/")
def read_root():
    return {"status": "online", "project": "SecondServe"}

# Milestone 1: Live Azure SQL Database Connection Diagnostic
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

# Milestone 2: SecondServe Shelf - Fetch active surplus products and vendor locations
@app.get("/api/v1/products")
def get_active_products():
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
