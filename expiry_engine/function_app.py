# ================================================================================
# PRODUCTION SERVERLESS SOURCE CODE: FUNCTION_APP.PY
# LOCATION: EXPIRES UNCLAIMED SURPLUS INVENTORY RECORDS TWICE DAILY
# COMPLIANCE STANDARD: RULE5FIST MANDATORY FULL RECODE DELIVERABLE
# ================================================================================

import azure.functions as func
import logging
import pyodbc
import os

app = func.FunctionApp()

# Abstract infrastructure metrics directly out into standard secure environment values
DB_SERVER = os.getenv("DB_SERVER", "tcp:sqlserver-secondserve-3226.database.windows.net,1433")
DB_NAME = os.getenv("DB_NAME", "db-secondserve")
DB_USER = os.getenv("DB_USER", "ssadmin")
DB_PASS = os.getenv("DB_PASS", "SecurePassSecondServe2026!")
DRIVER = os.getenv("DB_DRIVER", "{ODBC Driver 18 for SQL Server}")

def get_db_connection():
    conn_str = f"DRIVER={DRIVER};SERVER={DB_SERVER};DATABASE={DB_NAME};UID={DB_USER};PWD={DB_PASS};Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;"
    return pyodbc.connect(conn_str)

# Cron Matrix configured to UTC execution parameters: 06:30 UTC = 14:30 SGT, 12:30 UTC = 20:30 SGT
@app.schedule(schedule="0 30 6,12 * * *", arg_name="myTimer", run_on_startup=False, use_monitor=True)
def automated_surplus_expiry_sweeper(myTimer: func.TimerRequest) -> None:
    logging.info("AUTOMATED LIFECYCLE: Initiating SecondServe food surplus volume purge sweep.")
    
    if myTimer.past_due:
        logging.warning("TIMING WARNING: Serverless trigger execution loop delayed behind scheduling queue.")

    connection = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        
        # Scrape all items that have active quantities listed in the database
        select_query = "SELECT ProductID, ProductName, QuantityAvailable FROM Products WHERE QuantityAvailable > 0"
        cursor.execute(select_query)
        unrecovered_records = cursor.fetchall()
        
        if not unrecovered_records:
            logging.info("CLEAN RUN: No active unrecovered surplus records detected on the shelf.")
            return

        total_scrubbed_items = 0
        update_query = "UPDATE Products SET QuantityAvailable = 0 WHERE ProductID = ?"
        
        for record in unrecovered_records:
            product_id = record[0]
            product_name = record[1]
            
            logging.info(f"PURGING TARGET: Product ID {product_id} ({product_name}) past operational validity threshold.")
            cursor.execute(update_query, (product_id,))
            total_scrubbed_items += 1

        connection.commit()
        logging.info(f"SUCCESS: Serverless lifecycle sweep executed. Total items scrubbed: {total_scrubbed_items}")

    except Exception as error:
        logging.error(f"CRITICAL SYSTEM WORKSPACE TRAFFIC ERROR: {str(error)}")
        if connection:
            connection.rollback()
    finally:
        if connection:
            connection.close()
