import azure.functions as func
import datetime
import logging
import os
import pyodbc

app = func.FunctionApp()

DB_SERVER = os.getenv("DB_SERVER", "tcp:sqlserver-secondserve-3226new.database.windows.net,1433")
DB_NAME = os.getenv("DB_NAME", "db-secondserve")
DB_USER = os.getenv("DB_USER", "ssadmin")
DB_PASS = os.getenv("DB_PASS", "SecurePassSecondServe2026!")
DRIVER = os.getenv("DB_DRIVER", "{ODBC Driver 18 for SQL Server}")

def get_db_connection():
    conn_str = f"DRIVER={DRIVER};SERVER={DB_SERVER};DATABASE={DB_NAME};UID={DB_USER};PWD={DB_PASS};Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;"
    return pyodbc.connect(conn_str)

@app.timer_trigger(schedule="0 30 6,12 * * *", arg_name="mytimer", run_on_startup=False)
def smart_expiry_discount_timer(mytimer: func.TimerRequest) -> None:
    """
    Timer trigger that runs at 2:30 PM and 8:30 PM SGT (06:30 and 12:30 UTC).
    Automatically applies discounts to products nearing expiry.
    """
    utc_timestamp = datetime.datetime.utcnow().isoformat()
    logging.info(f"SmartExpiryDiscountTimer triggered at {utc_timestamp}")

    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Apply 50% discount to products expiring within 2 hours
        cursor.execute("""
            UPDATE Products
            SET CurrentDiscountPrice = OriginalPrice * 0.50
            WHERE QuantityAvailable > 0
            AND CurrentDiscountPrice > OriginalPrice * 0.50
        """)
        affected_50 = cursor.rowcount
        logging.info(f"Applied 50% discount to {affected_50} near-expiry products.")

        # Apply 30% discount to remaining products still at full price
        cursor.execute("""
            UPDATE Products
            SET CurrentDiscountPrice = OriginalPrice * 0.70
            WHERE QuantityAvailable > 0
            AND CurrentDiscountPrice = OriginalPrice
        """)
        affected_30 = cursor.rowcount
        logging.info(f"Applied 30% discount to {affected_30} products.")

        conn.commit()

    except Exception as e:
        logging.error(f"SmartExpiryDiscountTimer error: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()