from fastapi import Depends, HTTPException, APIRouter
from sqlmodel import Session, select
from starlette import status
from routes.auth import get_current_user
from db import get_session
from schemas import User, UserOutput, Portfolio,  PortfolioOutput, Transaction, TransactionInput, TransactionOutput
from helpers import lookup 
from datetime import datetime



router = APIRouter(prefix = "/transaction", tags = ["Transactions"])

@router.get("/history")
def get_transactions(user: User = Depends(get_current_user),
                     session: Session = Depends(get_session)):
    query = select(Transaction).where(Transaction.user_id == user.id)
    return session.exec(query).all()

@router.post("/buy")
def buy_stock(*, user: User = Depends(get_current_user),
              transaction: TransactionInput,
              session: Session = Depends(get_session)):
    if transaction.quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be greater than 0.")

    stock_data=lookup(transaction.stock) 
    if stock_data is None:
        raise HTTPException(status_code=404, detail="Stock symbol not found.")
    
    stock_price = stock_data['price']
    total_cost = stock_price * transaction.quantity

    if user.balance < total_cost:
        raise HTTPException(status_code= 400, detail = "Insufficient funds" )
    
    user.balance -= total_cost

    query = select(Portfolio).where(
        Portfolio.user_id == user.id, Portfolio.stock == transaction.stock.upper()
    )
    portfolio_entry = session.exec(query).first()

    if portfolio_entry:
        # Update existing portfolio entry
        portfolio_entry.quantity += transaction.quantity
        portfolio_entry.price = ((portfolio_entry.price * portfolio_entry.quantity)+ total_cost) / (portfolio_entry.quantity + transaction.quantity)  # Update average price
    else:
        # Add a new portfolio entry
        new_portfolio_entry = Portfolio(
            user_id=user.id,
            stock=transaction.stock.upper(),
            quantity=transaction.quantity,
            price=stock_price,
        )
        session.add(new_portfolio_entry)

    new_transaction = Transaction(
        user_id = user.id,
        stock = transaction.stock.upper(),
        quantity=transaction.quantity,
        price= stock_price,
        type="buy",
        timestamp= datetime.now().isoformat()
    )

    session.add(new_transaction)
    

    # Commit the changes
    session.commit()
    session.refresh(user)
    session.refresh(new_transaction)

    return {
        "message": "Stock purchased successfully.",
        "balance": user.balance,
        "portfolio": {
            "stock": transaction.stock.upper(),
            "quantity": transaction.quantity,
            "price": stock_price,
        },
    }

