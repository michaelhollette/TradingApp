from fastapi import Depends, HTTPException, APIRouter
from sqlmodel import Session, select
from helpers import lookup, lookup_watchlist
from db import get_session
from routes.auth import get_current_user
from schemas import User, UserOutput, Portfolio,  PortfolioOutput, Transaction, TransactionInput, TransactionOutput, Watchlist, WatchlistInput
import requests


router = APIRouter(prefix = "/watchlist", tags = ["Watchlist"])

@router.get("/")
def get_watchlist(user: User = Depends(get_current_user),
                  session: Session=Depends(get_session)) -> list:
    query = select(Watchlist).where(Watchlist.user_id==user.id)
    watchlist_items = session.exec(query).all()
    watchlist_data =[]

    for item in watchlist_items:
        print(item.stock)
        stock_data = lookup_watchlist(item.stock)
        if stock_data:
            watchlist_data.append({
                "id": item.id,
                "stock": item.stock,
                "name": item.name,
                "current_price": stock_data['price'],
                "historical_price": stock_data['history']
            })
        else:
            watchlist_data.append({
                "id": item.id,
                "stock": item.stock,
                "name": item.name,
                "current_price": None, 
                "historical_price": None
            })
     
    return watchlist_data


@router.post("/", response_model = Watchlist)
def add_to_watchlist(watchlist_code: WatchlistInput,
                     user: User = Depends(get_current_user),
                     session: Session = Depends(get_session)) -> Watchlist:
    stock_data = lookup(watchlist_code.stock)
    if stock_data is None:
        raise HTTPException(status_code=404, detail="Stock symbol not found or invalid.")
    new_item = Watchlist(
        stock = watchlist_code.stock.upper(),
        name = stock_data['name'],
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
