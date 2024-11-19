import requests

def lookup(symbol):
    api_key = "NY5RNEQMJO3SMITN"
    # URLs for the stock price and company overview
    price_url = f"https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol={symbol}&interval=1min&apikey={api_key}"
    overview_url = f"https://www.alphavantage.co/query?function=OVERVIEW&symbol={symbol}&apikey={api_key}"

    try:
        # Fetch stock price
        price_response = requests.get(price_url)
        price_response.raise_for_status()
        price_data = price_response.json()

        # Parse the data for the most recent price
        last_refreshed = price_data["Meta Data"]["3. Last Refreshed"]
        price = price_data["Time Series (1min)"][last_refreshed]["4. close"]

        # Fetch company overview
        overview_response = requests.get(overview_url)
        overview_response.raise_for_status()
        overview_data = overview_response.json()

        # Parse the company name
        company_name = overview_data["Name"]

        # Return combined result
        return {"name": company_name, "price": float(price), "symbol": symbol.upper()}
    except (requests.RequestException, KeyError, ValueError):
        return None
