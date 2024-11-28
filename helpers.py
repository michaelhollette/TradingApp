import requests

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

