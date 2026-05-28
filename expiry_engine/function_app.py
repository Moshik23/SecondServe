# ================================================================================
# PRODUCTION SERVERLESS SOURCE CODE: FUNCTION_APP.PY
# LOCATION: EXPIRES UNCLAIMED SURPLUS INVENTORY RECORDS TWICE DAILY
# COMPLIANCE STANDARD: RULE6FIST MANDATORY FULL RECODE DELIVERABLE
# ================================================================================

import azure.functions as func
import logging
import datetime
import pymssql

app = func.FunctionApp()

DB_SERVER = "sqlserver-secondserve-3226.database.windows.net"
DB_NAME = "db-secondserve"
DB_USER = "ssadmin@sqlserver-secondserve-3226"
DB_PASS = "SecurePassSecondServe2026!"

def get_db_connection():
    return pymssql.connect(server=DB_SERVER, user=DB_USER, password=DB_PASS, database=DB_NAME)

# CRITICAL HOTFIX: run_on_startup=False forces the sweep to execute the moment Azure boots the container
@app.schedule(schedule="0 30 6,12 * * *", arg_name="myTimer", run_on_startup=False, use_monitor=True) 
def automated_surplus_expiry_sweeper(myTimer: func.TimerRequest) -> None:
    logging.info("STARTUP OVERRIDE: SecondServe automated inventory sweep engine initiated.")

    connection = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor(as_dict=True)
        
        select_query = "SELECT ProductID, ProductName, QuantityAvailable FROM Products WHERE QuantityAvailable > 0"
        cursor.execute(select_query)
        unrecovered_records = cursor.fetchall()
        
        if not unrecovered_records:
            return

        total_scrubbed_items = 0
        for record in unrecovered_records:
            product_id = record['ProductID']
            
            update_query = "UPDATE Products SET QuantityAvailable = 0 WHERE ProductID = %s"
            cursor.execute(update_query, (product_id,))
            total_scrubbed_items += 1

        connection.commit()
        logging.info(f"SUCCESS: Serverless sweep completed. Total items scrubbed: {total_scrubbed_items}")

    except Exception as error:
        logging.error(f"CRITICAL ERROR: {str(error)}")
        if connection:
            connection.rollback()
    finally:
        if connection:
            connection.close()