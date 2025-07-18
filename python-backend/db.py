from sqlmodel import create_engine, Session


engine = create_engine(
    "sqlite:///trading_platform.db",
    connect_args={"check_same_thread": False}, # Needed for SQLite
    echo = True # Log generated for SQL - do not do this in production
)


def get_session():
    with Session(engine) as session:
        yield session