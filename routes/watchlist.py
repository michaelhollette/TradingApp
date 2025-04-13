from fastapi import Depends, HTTPException, APIRouter
from sqlmodel import Session, select
from helpers import lookup2, lookup_intraday
from db import get_session
from routes.auth import get_current_user
from schemas import User, UserOutput, Portfolio,  PortfolioOutput, Transaction, TransactionInput, TransactionOutput, Watchlist, WatchlistInput
import requests
import asyncio
import httpx

import logging
import time 
from typing import List
from functools import wraps


# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

async def measure_async_operation(operation_name: str, coroutine):
    """Utility function to measure and log async operation execution time"""
    start_time = time.perf_counter()
    result = await coroutine
    end_time = time.perf_counter()
    execution_time = end_time - start_time
    logger.info(f"{operation_name} took {execution_time:.2f} seconds")
    return result

router = APIRouter(prefix = "/watchlist", tags = ["Watchlist"])

@router.get("/")
async def get_watchlist(
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
) -> List[dict]:
    # Start timing the entire function
    total_start_time = time.perf_counter()

    # Measure database query execution time
    start_time = time.perf_counter()
    query = select(Watchlist).where(Watchlist.user_id == user.id)
    watchlist_items = session.exec(query).all()
    query_time = time.perf_counter() - start_time
    logger.info(f"Database query took {query_time:.2f} seconds")
    # Concatenate symbols for bulk API search
    symbols = ",".join([item.stock for item in watchlist_items])
    logger.info(f"Processing watchlist for {len(watchlist_items)} items")

    api_key = "FGkzWV4lrs1pDemA6kxNLzE7PdY4elEq"
    api_key2 = "tXI3IbsvZVPvZhdlB7iyGUbf4YYQJKiZ"
    api_key3 = "GhhSe5dXT7x8Sxf71TuPFccL8Ofx0c0b"

    # Fetch current prices with timing
    bulk_prices_url = f"https://financialmodelingprep.com/api/v3/quote/{symbols}?apikey={api_key}"
    async with httpx.AsyncClient() as client:
        bulk_prices_response = await measure_async_operation(
            "Bulk prices API request",
            client.get(bulk_prices_url)
        )
        bulk_prices_response.raise_for_status()
        
        start_time = time.perf_counter()
        bulk_prices_data = bulk_prices_response.json()
        logger.info(f"JSON parsing took {time.perf_counter() - start_time:.2f} seconds")

    # Map stock prices to symbols
    start_time = time.perf_counter()
    stock_price_map = {item["symbol"]: item for item in bulk_prices_data}
    logger.info(f"Price mapping took {time.perf_counter() - start_time:.2f} seconds")

    # Fetch historical data asynchronously with timing
    logger.info("Starting historical data fetch")
    start_time = time.perf_counter()
    tasks = [lookup_intraday(item.stock) for item in watchlist_items]
    historical_data = await asyncio.gather(*tasks)
    historical_fetch_time = time.perf_counter() - start_time
    logger.info(f"Historical data fetch took {historical_fetch_time:.2f} seconds")

    # Combine results with timing
    start_time = time.perf_counter()
    watchlist_data = []
    for item, stock_data in zip(watchlist_items, historical_data):
        stock_info = stock_price_map.get(item.stock)
        watchlist_data.append({
            "id": item.id,
            "stock": item.stock,
            "name": item.name,
            "current_price": stock_info["price"] if stock_info else None,
            "historical_price": stock_data["history"] if stock_data else None,
            "image": item.image_url,
        })
    
    data_combination_time = time.perf_counter() - start_time
    logger.info(f"Data combination took {data_combination_time:.2f} seconds")

    # Log total execution time
    total_time = time.perf_counter() - total_start_time
    logger.info(f"Total execution time: {total_time:.2f} seconds")

    return watchlist_data

@router.post("/", response_model = Watchlist)
def add_to_watchlist(watchlist: WatchlistInput,
                     user: User = Depends(get_current_user),
                     session: Session = Depends(get_session)) -> Watchlist:
   
    new_item = Watchlist(
        stock = watchlist.stock.upper(),
        name = watchlist.name,
        image_url=watchlist.image_url,
        user_id = user.id
    )

    session.add(new_item)
    session.commit()
    session.refresh(new_item)
    return new_item

@router.delete("/{item_id}")
def delete_from_watchlist(item_id : int, 
                          user: User = Depends(get_current_user),
                          session: Session = Depends(get_session)) -> dict:
    query = select(Watchlist).where(Watchlist.id == item_id, Watchlist.user_id == user.id)
    item = session.exec(query).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    session.delete(item)
    session.commit()
    return {"message": "Item deleted successfully"}
