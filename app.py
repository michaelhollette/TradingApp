from fastapi import FastAPI, HTTPException, Depends
import uvicorn
from sqlmodel import  SQLModel, Session, select
from db import engine, get_session
from schemas import User, Transaction, Portfolio  
from routes import auth, portfolio, transaction, user


app = FastAPI(title = "Trading Application")
app.include_router(auth.router, prefix="/api")
app.include_router(portfolio.router, prefix="/api")
app.include_router(transaction.router, prefix="/api")
app.include_router(user.router, prefix="/api")



@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(engine)


if __name__ == "__main__":
    uvicorn.run("app:app", reload=True)