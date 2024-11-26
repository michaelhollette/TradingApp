from fastapi import Depends, HTTPException, APIRouter
from sqlmodel import Session, select
from starlette import status
from routes.auth import get_current_user
from db import get_session
from schemas import User, UserOutput, Portfolio,  PortfolioOutput
from helpers import lookup 
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
    result = lookup(symbol)
    if result is None:
        raise HTTPException(status_code=404, detail="Stock symbol not found or invalid.")
    return result




@router.get("/quote/{symbol}/history")
async def get_stock_history(symbol: str):
    """
    Fetch historical weekly stock prices for the past 52 weeks for a given symbol.
    """
    api_key = "1U6SNELURHQKEAPU"
    url = f"https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY_ADJUSTED&symbol={symbol}&apikey={api_key}"

    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()

        if "Weekly Adjusted Time Series" not in data:
            raise HTTPException(status_code=404, detail="Stock symbol not found or invalid.")

        time_series = data["Weekly Adjusted Time Series"]
        # Extract the last 52 weeks
        historical_data = [
            {
                "date": date,
                "price": float(values["4. close"])
            }
            for date, values in list(time_series.items())[:52]
        ]

        return {"symbol": symbol.upper(), "history": historical_data}

    except (requests.RequestException, KeyError, ValueError):
        raise HTTPException(status_code=500, detail="Failed to fetch historical stock data.")
