import requests
from fastapi import Depends, HTTPException, APIRouter
from datetime import date, timedelta
import httpx



def lookup(symbol):
    api_key = "NY5RNEQMJO3SMITN"
    api_key2 ="1U6SNELURHQKEAPU"
    # URLs for the stock price and company overview
    price_url = f"https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol={symbol}&interval=1min&apikey={api_key}"
    overview_url = f"https://www.alphavantage.co/query?function=OVERVIEW&symbol={symbol}&apikey={api_key}"

    try:
        # Fetch stock price
        price_response = requests.get(price_url)
        price_response.raise_for_status()
        price_data = price_response.json()

        # Obtain data for the most recent price
        last_refreshed = price_data["Meta Data"]["3. Last Refreshed"]
        price = price_data["Time Series (1min)"][last_refreshed]["4. close"]

        # Fetch company overview
        overview_response = requests.get(overview_url)
        overview_response.raise_for_status()
        overview_data = overview_response.json()

        # Obtain company name, exchange, sector and industry data
        company_name = overview_data["Name"]
        company_description = overview_data["Description"]
        exchange = overview_data["Exchange"]
        sector = overview_data["Sector"]
        industry = overview_data["Industry"]

        # Construct a logo URL (Clearbit Logo API)
        company_domain = overview_data["OfficialSite"]
        logo_url = f"https://logo.clearbit.com/{company_domain}"

        # Return combined result
        return {"name": company_name, "price": float(price), "symbol": symbol.upper(), "description": company_description, "exchange" : exchange, "sector": sector.capitalize(), "industry": industry.capitalize(), "logo": logo_url}
    except (requests.RequestException, KeyError, ValueError):
        return None
    


def lookup_watchlist(symbol):
    api_key ="UL8Q0UEZA5W5037I"

    prices_url = f"https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol={symbol}&interval=30min&apikey={api_key}"

    try:
        response = requests.get(prices_url)
        response.raise_for_status()
        data = response.json()

        last_refreshed =  data["Meta Data"]["3. Last Refreshed"]
        latest_price = data["Time Series (30min)"][last_refreshed]["4. close"]
        print("Latest Price", latest_price)



        time_series = data["Time Series (30min)"]

        print("Time Series:", time_series)
        # Extract the last 24 half-hour intervals
        historical_data = [
            {
                "date": date,
                "price": float(values["4. close"])
            }
            for date, values in list(time_series.items())[:33]
        ]
        print(historical_data)

        return {"symbol": symbol.upper(), "price": latest_price, "history": historical_data}
    
    except (requests.RequestException, KeyError, ValueError):
        return None

def lookup2(symbol):
    api_key = "FGkzWV4lrs1pDemA6kxNLzE7PdY4elEq"
    api_key2 ="tXI3IbsvZVPvZhdlB7iyGUbf4YYQJKiZ"
    api_key3="GhhSe5dXT7x8Sxf71TuPFccL8Ofx0c0b"

    # URLs for the stock price and company overview
    price_url = f"https://financialmodelingprep.com/api/v3/quote/{symbol}?apikey={api_key}"
    overview_url = f"https://financialmodelingprep.com/api/v3/profile/{symbol}?apikey={api_key}"
    print(price_url)
    

    try:
        # Fetch stock price
        price_response = requests.get(price_url)
        price_response.raise_for_status()
        price_data = price_response.json()[0]

        # Obtains data for the most recent price
        
        price = price_data["price"]
       
        # Fetches company overview
        overview_response = requests.get(overview_url)
        overview_response.raise_for_status()
        overview_data = overview_response.json()[0]

        # Obtains company name, exchange, sector and industry data
        company_name = overview_data["companyName"]
        company_description = overview_data["description"]
        exchange = overview_data["exchange"]
        sector = overview_data["sector"]
        industry = overview_data["industry"]
        market_cap = overview_data["mktCap"]
        street = overview_data["address"] 
        city = overview_data["city"] 
        state = overview_data["state"] 
        zip = overview_data["zip"] 
        country = overview_data["country"]
        logo_url = overview_data["image"]

        address_details = [street, city, state, zip, country]

        address = ", ".join(s for s in address_details if s)

        # Returns combined result
        return {"name": company_name, "price": float(price), "symbol": symbol.upper(), "description": company_description, "exchange" : exchange, "sector": sector.capitalize(), "industry": industry.capitalize(), "market_cap": market_cap, "logo": logo_url, "address": address}
    except (requests.RequestException, KeyError, ValueError):
        return None



async def lookup_intraday(symbol):
    current_date = date.today()
    previous_date = current_date - timedelta(days=1)

    current_date_str = current_date.strftime("%Y-%m-%d")
    previous_date_str = previous_date.strftime("%Y-%m-%d")

    api_key = "FGkzWV4lrs1pDemA6kxNLzE7PdY4elEq"
    api_key2 = "tXI3IbsvZVPvZhdlB7iyGUbf4YYQJKiZ"
    api_key3="GhhSe5dXT7x8Sxf71TuPFccL8Ofx0c0b"
    url = f"https://financialmodelingprep.com/api/v3/historical-chart/30min/{symbol}?from={previous_date_str}&to={current_date_str}&extended=true&apikey={api_key}"
    print(url)

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()

            historical_prices = [
                {"date": entry["date"], "close": entry["close"]}
                for entry in data[:30]
            ]

            return {"symbol": symbol.upper(), "history": historical_prices}
    except (httpx.RequestError, KeyError, ValueError):
        return None


def lookup_daily_history(symbol):
    api_key = "FGkzWV4lrs1pDemA6kxNLzE7PdY4elEq"
    api_key2 ="tXI3IbsvZVPvZhdlB7iyGUbf4YYQJKiZ"
    api_key3="GhhSe5dXT7x8Sxf71TuPFccL8Ofx0c0b"


    url = f"https://financialmodelingprep.com/api/v3/historical-price-full/{symbol}?apikey={api_key}"

    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()

        if "symbol" not in data:
            raise HTTPException(status_code=404, detail="Stock symbol not found or invalid.")
        

        time_series = data["historical"][0]
        # Extract the last 30 days
        historical_data = [
                            {"date": entry["date"], "close": entry["close"]}
                            for entry in data["historical"][:30]
                        ]

        return {"symbol": symbol.upper(), "history": historical_data}

    except (requests.RequestException, KeyError, ValueError):
        raise HTTPException(status_code=500, detail="Failed to fetch historical stock data.")

