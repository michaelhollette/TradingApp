from fastapi import Depends, HTTPException, APIRouter
from sqlmodel import Session, select
from helpers import lookup2, lookup_intraday
from db import get_session
from routes.auth import get_current_user
from schemas import User, UserOutput, Portfolio,  PortfolioOutput, Transaction, TransactionInput, TransactionOutput, Watchlist, WatchlistInput
import requests
import asyncio
import httpx

router = APIRouter(prefix = "/watchlist", tags = ["Watchlist"])

@router.get("/")
async def get_watchlist(user: User = Depends(get_current_user),
                        session: Session = Depends(get_session)) -> list:
    query = select(Watchlist).where(Watchlist.user_id == user.id)
    watchlist_items = session.exec(query).all()

    # Concatenates all symbols bulk API searchp
    symbols = ",".join([item.stock for item in watchlist_items])

    # Fetches current prices for watchlist items 
    bulk_prices_url = f"https://financialmodelingprep.com/api/v3/quote/{symbols}?apikey=GhhSe5dXT7x8Sxf71TuPFccL8Ofx0c0b"
    async with httpx.AsyncClient() as client:
        bulk_prices_response = await client.get(bulk_prices_url)
        bulk_prices_response.raise_for_status()
        bulk_prices_data = bulk_prices_response.json()

    # Maps  stock prices to symbols 
    stock_price_map = {item["symbol"]: item for item in bulk_prices_data}

    # Fetches historical data aynchronously
    tasks = [
        lookup_intraday(item.stock)
        for item in watchlist_items
    ]
    historical_data = await asyncio.gather(*tasks)

    # Combines results
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
