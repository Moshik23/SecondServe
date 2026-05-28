# ================================================================================
# PRODUCTION SERVERLESS SOURCE CODE: FUNCTION_APP.PY
# LOCATION: EXPIRES UNCLAIMED SURPLUS INVENTORY RECORDS TWICE DAILY
# EXECUTIONS TRIGGERED AT SGT 14:30 AND 20:30 (UTC 06:30 AND 12:30)
# COMPLIANCE STANDARD: RULE6FIST MANDATORY FULL RECODE DELIVERABLE
# ================================================================================

import azure.functions as func
import logging
import datetime
import pymssql

# Initialize the global serverless function app engine architecture interface
app = func.FunctionApp()

# Database infrastructure coordinates mapping to Azure SQL Primary Tier
DB_SERVER = "sqlserver-secondserve-3226.database.windows.net"
DB_NAME = "db-secondserve"
# CRITICAL FIX: Appending server name to username guarantees Azure SQL routing success
DB_USER = "ssadmin@sqlserver-secondserve-3226"
DB_PASS = "SecurePassSecondServe2026!"

def get_db_connection():
    return pymssql.connect(server=DB_SERVER, user=DB_USER, password=DB_PASS, database=DB_NAME)

@app.schedule(schedule="0 30 6,12 * * *", arg_name="myTimer", run_on_startup=False, use_monitor=True) 
def automated_surplus_expiry_sweeper(myTimer: func.TimerRequest) -> None:
    utc_timestamp = datetime.datetime.utcnow().replace(tzinfo=datetime.timezone.utc).isoformat()
    
    if myTimer.past_due:
        logging.warning("The background timer trigger task is executing behind its scheduled cron matrix.")

    logging.info(f"SecondServe automated inventory sweep engine initiated successfully at UTC: {utc_timestamp}")

    connection = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor(as_dict=True)
        
        logging.info("Scanning for unrecovered 'Stall Waste' items whose peak windows have expired...")
        
        select_query = "SELECT ProductID, ProductName, QuantityAvailable FROM Products WHERE QuantityAvailable > 0"
        cursor.execute(select_query)
        unrecovered_records = cursor.fetchall()
        
        if not unrecovered_records:
            logging.info("Zero residual surplus listings left on the SecondServe shelf. Sweep complete.")
            return

        total_scrubbed_items = 0
        
        for record in unrecovered_records:
            product_id = record['ProductID']
            product_name = record['ProductName']
            qty_left = record['QuantityAvailable']
            
            logging.info(f"Scrubbing ProductID {product_id} ({product_name}) - Leftover Quantity: {qty_left}")
            
            update_query = """
                UPDATE Products 
                SET QuantityAvailable = 0 
                WHERE ProductID = %s
            """
            cursor.execute(update_query, (product_id,))
            total_scrubbed_items += 1

        connection.commit()
        logging.info(f"SUCCESS: Serverless sweep completed. Total items processed: {total_scrubbed_items}")

    except Exception as error:
        logging.error(f"CRITICAL: Background sweep operation aborted due to transactional drop: {str(error)}")
        if connection:
            logging.info("Executing transaction rollback matrix...")
            connection.rollback()
            
    finally:
        if connection:
            connection.close()
            logging.info("Azure SQL relational connection channel securely severed.")