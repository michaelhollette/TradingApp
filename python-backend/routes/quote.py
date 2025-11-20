from fastapi import HTTPException, APIRouter
from financial_data.market_data import MarketDataService 
from typing import Annotated
from models import StockHistoryData, CompanyMarketInfo

router = APIRouter(prefix="/quote", tags=["Quote"])




@router.get("/{symbol}")
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



@router.get("/{symbol}/history")
async def get_daily_stock_history(symbol: str)-> StockHistoryData:
    
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