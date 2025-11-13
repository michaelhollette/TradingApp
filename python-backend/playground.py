from financial_data import MarketDataService
import asyncio

async def main():

    service = MarketDataService()

    price_data = await service.get_finnhub_price("SONY")
    print(f"{price_data.name} Price Data: ",price_data)

    batch_prices = await service.get_finnhub_bulk_prices(["AAPL", "MSFT", "GOOGL"])
    print("Batch Prices: ", batch_prices)

    fmp_price = await service.get_fmp_price("AAPL")
    print("FMP Price Data: ", fmp_price)



if __name__ == "__main__":
    asyncio.run(main())