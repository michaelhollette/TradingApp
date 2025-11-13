from pydantic import BaseModel

class StockData(BaseModel):
    symbol: str
    name: str = ""
    price: float

class StockPrice(BaseModel):
    symbol: str
    price: float | None = None

class CompanyData(BaseModel):
    name: str
    price: float
    symbol: str
    description: str
    exchange: str   
    sector: str
    industry: str
    market_cap: float
    logo: str      
    address: str    


class StockHistory(BaseModel):
    date: str
    open: float | None = None
    high: float | None = None   
    low: float | None = None
    close: float | None = None
    volume: int | None = None

class StockHistoryData(BaseModel):
    symbol: str
    price: float | None = None
    history: list[StockHistory]


class PortfolioOutput(BaseModel):
    symbol: str
    company: str
    quantity: int
    avg_price: float
    current_price: float | None = None