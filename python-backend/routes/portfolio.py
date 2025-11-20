from fastapi import Depends, HTTPException, APIRouter, Query
from sqlmodel import Session, select
from starlette import status
from routes.auth import get_current_user
from db import get_session
from schemas import User, UserOutput, Portfolio,  PortfolioOutput
import requests
from financial_data.market_data import MarketDataService 
from typing import Annotated
from models import StockHistoryData, CompanyMarketInfo

router = APIRouter(prefix="/portfolio", tags=["Portfolio"])

@router.get("/")
def get_portfolio(user: User = Depends(get_current_user), 
                  session: Session = Depends(get_session)) -> list:
    query = select(Portfolio).where(Portfolio.user_id ==user.id)

    print("Query: ", query)
    print("Session: ", session.exec(query).all())
    return session.exec(query).all()



@router.get("/quote/{symbol}")
async def get_stock_quote(symbol: str):
    """
    Fetch the latest stock price and company name for a given symbol.
    """

    print("Symbol:", symbol)
    service = MarketDataService()
    print("Fetching company data from class method...")
    result = await      service.get_fmp_company_data(symbol)
    if result is None:
        raise HTTPException(status_code=404, detail="Stock symbol not found or invalid.")
    return result



@router.get("/full")
async def get_portfolio_with_prices(
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # 1. Get portfolio from database
    portfolio = session.exec(
        select(Portfolio).where(Portfolio.user_id == user.id)
    ).all()

    # 2. Extract stock symbols
    symbols = [item.stock for item in portfolio]

    # 3. Get batch prices from Finnhub
    service = MarketDataService()
    prices = await service.get_finnhub_bulk_prices(symbols)

    # 4. Combine portfolio & prices into a response
    result = []
    for item in portfolio:
        current_price = prices.get(item.stock).price if item.stock in prices else None
        result.append({
            "symbol": item.stock,
            "company": item.name,
            "quantity": item.quantity,
            "avg_price_paid": item.price,
            "current_price": current_price,
        })

    return result

@router.get("/quote/{symbol}/history")
async def get_stock_history(symbol: str)-> StockHistoryData:
    
    service = MarketDataService()
    result = await service.get_twelve_data_stock_history(symbol, interval=1, unit="day", output_size=30)
    if result is None:
        raise HTTPException(status_code=404, detail="Stock symbol not found or invalid.")
    return result

@router.get("/top-companies", response_model=list[CompanyMarketInfo])
async def get_top_companies_by_market_cap(
    limit: int = 10,
    exchange: str = "NASDAQ"
):
    service = MarketDataService()
    companies = await service.get_companies_by_market_cap(limit=limit, exchange=exchange)
    return companies    