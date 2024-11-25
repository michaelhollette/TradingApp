from fastapi import Depends, HTTPException, APIRouter
from sqlmodel import Session, select
from starlette import status
from routes.auth import get_current_user
from db import get_session
from schemas import User, UserOutput, Portfolio,  PortfolioOutput, Transaction, TransactionInput, TransactionOutput
from helpers import lookup 
from datetime import datetime



router = APIRouter(prefix = "/transaction", tags = ["Transactions"])

@router.get("/history", response_model = list[TransactionOutput])
def get_transactions(user: User = Depends(get_current_user),
                     session: Session = Depends(get_session)) -> list[TransactionOutput]:
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
    stock_name = stock_data['name']
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
            name = stock_name,
            stock=transaction.stock.upper(),
            quantity=transaction.quantity,
            price=stock_price,
        )
        session.add(new_portfolio_entry)

        query = select(Portfolio).where(
        Portfolio.user_id == user.id, Portfolio.stock == transaction.stock.upper()
        )
        portfolio_entry = session.exec(query).first()

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
    session.refresh(portfolio_entry)


    

    return {
        "message": "Stock purchased successfully.",
        "balance": user.balance,
        "portfolio": {
            "name": stock_name,
            "stock": portfolio_entry.stock,
            "quantity": portfolio_entry.quantity,
            "price": portfolio_entry.price,
            
        },
        "transaction" : {
            "stock" : transaction.stock.upper(),
            "price" : stock_price,
            "quantity" : transaction.quantity
        }
    }

@router.post("/sell")
def sell_stock(*, user : User = Depends(get_current_user),
               transaction: TransactionInput,
               session: Session = Depends(get_session)):
    
    if transaction.quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be greater than 0.")
    
    stock_data=lookup(transaction.stock) 
    if stock_data is None:
        raise HTTPException(status_code=404, detail="Stock symbol not found.")
    
    stock_price = stock_data['price']
    stock_name = stock_data['name']

    total_revenue = stock_price * transaction.quantity
    
    #Check whether user has bough enough stocks
    query = select(Portfolio).where(
        Portfolio.user_id == user.id, Portfolio.stock == transaction.stock.upper()
    )
    portfolio_entry = session.exec(query).first()
    if not portfolio_entry:
        raise HTTPException(status_code=404, detail="Stock not found in portfolio.")

    elif portfolio_entry.quantity < transaction.quantity:
        raise HTTPException(status_code = 400, detail=f"{user.username} does not hold enough stocks to make this transaction")
    
    elif portfolio_entry.quantity == transaction.quantity:
        session.delete(portfolio_entry)
        portfolio_entry.quantity -= transaction.quantity


    else:
        portfolio_entry.quantity -= transaction.quantity


    user.balance += total_revenue

    new_transaction = Transaction(
        user_id=user.id,
        stock=transaction.stock.upper(),
        quantity=transaction.quantity,
        price=stock_price,
        type="sell",
        timestamp=datetime.now().isoformat(),
    )

    session.add(new_transaction)

    # Commit the changes
    session.commit()
    session.refresh(user)

    return{
        "message": "Stock sold successfully.",
        "balance": user.balance,
        "portfolio": None if portfolio_entry.quantity  == 0 else {
            "name": stock_name,
            "stock": portfolio_entry.stock,
            "quantity": portfolio_entry.quantity,
            "price": portfolio_entry.price,
            
        },
        "transaction" : {
            "stock" : transaction.stock.upper(),
            "price" : stock_price,
            "quantity" : transaction.quantity
        }
        
    }

    


