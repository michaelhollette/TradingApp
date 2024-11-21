from fastapi import FastAPI, HTTPException, Depends
import uvicorn
from sqlmodel import  SQLModel, Session, select
from db import engine, get_session
from schemas import User, Transaction, Portfolio  
from routes import auth, portfolio, transaction, user
from fastapi.middleware.cors import CORSMiddleware



app = FastAPI(title = "Trading Application")
app.include_router(auth.router, prefix="/api")
app.include_router(portfolio.router, prefix="/api")
app.include_router(transaction.router, prefix="/api")
app.include_router(user.router, prefix="/api")



@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow requests from your React app
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers
)

@app .get("/api/")
#Define a function called welcome, that does nothing but return a dictionary with a single message
def welcome():
    #Returns a friendly welcome message.
    return {'message':f'Welcome the Trading Application'}



if __name__ == "__main__":
    uvicorn.run("app:app", reload=True)