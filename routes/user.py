from fastapi import Depends, HTTPException, APIRouter
from sqlmodel import Session, select
from starlette import status
from routes.auth import get_current_user
from db import get_session
from schemas import User, UserOutput, Portfolio,  PortfolioOutput, Transaction, TransactionInput, TransactionOutput
from helpers import lookup 

router = APIRouter(prefix = "/user", tags =["User"])

@router.put("/add-funds")
def add_funds(*, user: User = Depends(get_current_user),
              amount : float,
              session: Session = Depends(get_session)):
    
    if amount <0:
        raise HTTPException (status_code= 400, details= "Amount must be greater than 0")
    query = select(User).where(User.id == user.id)
    user = session.exec(query).first()

    user.balance += amount

    session.add(user)
    session.commit()
    session.refresh(user)

    return {"message": "Funds added successfully.", "balance": user.balance}




