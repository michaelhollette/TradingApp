from sqlmodel import create_engine
from sqlalchemy import text  # Import the text function for raw SQL

# Replace with your actual database URL
DATABASE_URL = "sqlite:///../trading_platform.db"
engine = create_engine(DATABASE_URL)

# Migration to add the 'name' column to the 'portfolio' table
def migrate():
    with engine.connect() as connection:
        # Use `text` to execute the raw SQL query
        connection.execute(text("ALTER TABLE portfolio ADD COLUMN name TEXT"))
        print("Column 'name' added successfully to the 'portfolio' table.")


if __name__ == "__main__":
    print("Running migration: Add 'name' column to 'portfolio' table")
    migrate()
    print("Migration completed successfully.")
