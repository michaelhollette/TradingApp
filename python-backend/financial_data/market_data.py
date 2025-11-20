import requests
from fastapi import Depends, HTTPException, APIRouter
from datetime import date, timedelta
import httpx
import asyncio
from models import CompanyData, StockData, StockPrice, StockHistoryData, StockHistory, CompanyMarketInfo
import finnhub

class MarketDataService:
    def __init__(self):
        self.fmp_api_key = "GhhSe5dXT7x8Sxf71TuPFccL8Ofx0c0b"
        self.fmp_api_key2 = "1U6SNELURHQKEAPU"
        self.fmp_api_key3= ""
        self.fmp_price_base_url = "https://financialmodelingprep.com/stable/quote-short"
        self.fmp_company_base_url = "https://financialmodelingprep.com/stable/profile"

        self.finnhub_api_key = "d3uepkpr01qil4apo050d3uepkpr01qil4apo05g"

        self.twelve_data_api_key = "bf3adc98595c43e8a65dea9699e6c3c6"
        self.twelve_data_base_url = "https://api.twelvedata.com"

    async def get_finnhub_price(self, symbol: str) -> StockData:
        # Could add image to this later
        symbol = symbol.upper()

        try:
            print("Connecting to Finnhub API")
            client = finnhub.Client(api_key=self.finnhub_api_key)
            quote = client.quote(symbol)
            if quote and 'c' in quote:
                company_profile = client.company_profile2(symbol=symbol)
                if company_profile:
                    print("Stock data received successfully")
                    return StockData(symbol=symbol.upper(), price=quote['c'], name=company_profile.get('name', ''))
                else:
                    print("No company profile data received")
                    return StockData(symbol=symbol.upper(), price=quote['c'])
            else:
                print("No valid quote data received")
                return None
        except Exception:
            print("Error occurred while fetching data from Finnhub")
            return None
    async def get_finnhub_bulk_prices(self, symbols: list[str]) -> dict[str, StockPrice]:
        prices = {}
        try:
            print("Connecting to Finnhub API for bulk prices")
            client = finnhub.Client(api_key=self.finnhub_api_key)
            tasks = []
            for symbol in symbols:
                tasks.append(asyncio.to_thread(client.quote, symbol))
            
            quotes = await asyncio.gather(*tasks)

            for symbol, quote in zip(symbols, quotes):
                if quote and 'c' in quote:
                    prices[symbol] = StockPrice(symbol=symbol, price=quote['c'])
                else:
                    prices[symbol] = StockPrice(symbol=symbol, price=None)

            print("Bulk prices received successfully from Finnhub")
            return prices
        except Exception as e:
            print(f"Error occurred while fetching bulk prices from Finnhub: {e}")
            return prices
        
    async def get_twelve_data_batch_prices(self, symbols: list[str]) -> dict[str, StockPrice]:
        try:
            print("Fetching batch prices from Twelve Data for symbols: ", symbols)
            payload = {
                f"req_{i + 1}": {"url": f"/price?symbol={symbol}&apikey={self.twelve_data_api_key}"}
                for i, symbol in enumerate(symbols)
            }
            async with httpx.AsyncClient() as client:
                response = await client.post(f"{self.twelve_data_base_url}/batch", json=payload)
            
            
                response.raise_for_status()

            print("Twelve Data request successful")

            response = response.json()
            batch_prices = {}
            for req_key, req_entry in response['data'].items():
                try:
                    request_number = req_key.strip("req_")

                    
                    batch_prices[symbols[int(request_number) - 1]] = StockPrice(
                        symbol=symbols[int(request_number) - 1],
                        price = float(req_entry['response']['price'])
                    )
                except (KeyError, TypeError, ValueError):
                    # Handle errors gracefully
                    print(f"⚠️ No price for {symbols[int(request_number) - 1]}: {req_entry}")

            return batch_prices


        except httpx.RequestError as e:
            print(f"An error occurred while fetching batch prices: {e}")
            return None


    async def get_fmp_price(self, symbol: str)-> StockData:
        price_url = f"{self.fmp_price_base_url}?symbol={symbol}&apikey={self.fmp_api_key}"

        try:
            print(f"Fetching price from {self.fmp_price_base_url} for symbol {symbol}")
            async with httpx.AsyncClient() as client:
                print("Sending request...")
                response = await client.get(price_url)
                response.raise_for_status()
                print("Request successful")

                data = response.json()
                if not data:
                    return None
                
                stock_info = data[0]
                return StockData(symbol=stock_info["symbol"], price=stock_info["price"])
        except (httpx.RequestError, KeyError, ValueError):
            return None
        
    async def get_fmp_company_data(self, symbol: str) -> CompanyData:
        company_url=f"{self.fmp_company_base_url}?symbol={symbol}&apikey={self.fmp_api_key}"

        try:
            async with httpx.AsyncClient() as client:
                print("Sending request...")

                response = await client.get(company_url)
                response.raise_for_status()
                print("Request successful")

                data = response.json()


                if not data:
                    ("No data in data response")
                    return None
                
                company_info = data[0]
                address_details = [ company_info.get("address"), 
                                    company_info.get("city"), 
                                    company_info.get("state"), 
                                    company_info.get("zip"), 
                                    company_info.get("country")]
                
                
                return CompanyData(
                    name=company_info["companyName"],
                    price=company_info["price"],
                    symbol=company_info["symbol"],
                    description=company_info["description"],
                    exchange=company_info["exchange"],
                    sector=company_info["sector"],
                    industry=company_info["industry"],
                    market_cap=company_info["marketCap"],
                    logo=company_info["image"],     
                    address=", ".join(s for s in address_details if s))
                
               
        except (httpx.RequestError, KeyError, ValueError):
            return None
        
    async def get_twelve_data_stock_history(self, symbol: str, interval: int = 1, unit: str = "min", output_size: int = 30) -> StockHistoryData:
        current_date = date.today()
        start_date = current_date - timedelta(days=output_size)

        current_date = current_date.strftime("%Y-%m-%d")
        previous_date = start_date.strftime("%Y-%m-%d")

        try :
            url = f"{self.twelve_data_base_url}/time_series?symbol={symbol}&interval={interval}{unit}&start_date={previous_date}&apikey={self.twelve_data_api_key}&format=JSON"
            print(f"Fetching stock history from Twelve Data for symbol {symbol}")
            async with httpx.AsyncClient() as client:
                response = await client.get(url)
                response.raise_for_status()
                print("Request successful")

                data = response.json()
                if "values" not in data:
                    return None
                
                history_entries = []
                for entry in data["values"]:
                    history_entries.append(
                        StockHistory(
                            date=entry["datetime"],
                            open=float(entry["open"]),
                            high=float(entry["high"]),
                            low=float(entry["low"]),
                            close=float(entry["close"]),
                            volume=int(entry["volume"])
                        )
                    )
                
                return StockHistoryData(
                    symbol=symbol.upper(),
                    price=float(data["values"][0]["close"]),
                    history=history_entries
                )
            
        except (httpx.RequestError, KeyError, ValueError):
            return None


    async def get_companies_by_market_cap(self, limit: int = 10, exchange: str = "NASDAQ") -> list[CompanyMarketInfo]:
        try:
            url = f"{self.fmp_company_base_url}/company-screener?exchange={exchange}&apikey={self.fmp_api_key}&limit={limit}&sort=marketCap&order=desc"
            print(f"Fetching top {limit} companies by market cap from FMP on exchange {exchange}")
            async with httpx.AsyncClient() as client:
                response = await client.get(url)
                response.raise_for_status()
                print("Request successful")

                data = response.json()
                companies = []
                for company_info in data:
                    companies.append(
                        CompanyMarketInfo(
                            symbol=company_info["symbol"],
                            name=company_info["companyName"],
                            market_cap=company_info["marketCap"],
                            price=company_info["price"]
                        )
                    )
                return companies
            
        except (httpx.RequestError, KeyError, ValueError):
            return None