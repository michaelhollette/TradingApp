from fastapi import Depends, HTTPException, APIRouter
from sqlmodel import Session, select
from starlette import status
from routes.auth import get_current_user
from db import get_session
from schemas import User, UserOutput, Portfolio,  PortfolioOutput
from helpers import lookup2, lookup_daily_history
import requests


router = APIRouter(prefix="/portfolio", tags=["Portfolio"])

@router.get("/")
def get_portfolio(user: UserOutput = Depends(get_current_user), 
                  session: Session = Depends(get_session)) -> list:
    query = select(Portfolio).where(Portfolio.user_id ==user.id)
    return session.exec(query).all()



@router.get("/quote/{symbol}")
async def get_stock_quote(symbol: str):
    """
    Fetch the latest stock price and company name for a given symbol.
    """
    result = lookup2(symbol)
    if result is None:
        raise HTTPException(status_code=404, detail="Stock symbol not found or invalid.")
    return result




@router.get("/quote/{symbol}/history")
async def get_stock_history(symbol: str):
    
    result = lookup_daily_history(symbol)

    if result is None:
        raise HTTPException(status_code=404, detail="Stock symbol not found or invalid.")
    return result

