from sqlmodel import SQLModel, Field, Relationship, Column, VARCHAR
from passlib.context import CryptContext


pwd_context = CryptContext(schemes=['bcrypt']) # Needed for password hashing

class TransactionInput(SQLModel):
    stock: str
    quantity: int

class Transaction(TransactionInput, table=True):
    id: int | None = Field(default=None, primary_key=True)
    price: float
    type: str   
    timestamp: str
    user_id: int = Field(foreign_key="user.id")
    user: "User" = Relationship(back_populates="transactions")

class TransactionOutput(TransactionInput):
    id: int
    price: float
    timestamp: str
    type: str   





class Portfolio(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str

    stock: str
    quantity: int
    price: float
    user_id: int = Field(foreign_key="user.id")
    user: "User" = Relationship(back_populates="portfolio")

class PortfolioOutput(SQLModel):
    id: int
    name: str
    stock: str
    quantity: int
    price: float

class WatchlistInput(SQLModel):
    stock: str
    

class Watchlist(WatchlistInput, table = True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    user_id: int = Field(foreign_key="user.id")
    user: "User" = Relationship(back_populates="watchlist")



class User(SQLModel, table=True):
    id: int | None = Field(primary_key=True, default=None)
    username: str = Field(sa_column=Column("username", VARCHAR, unique=True, index=True))  # Ensures uniqueness
    password_hash: str = ""
    balance: float | None = 0
    transactions: list[Transaction] = Relationship(back_populates="user")
    portfolio: list[Portfolio] = Relationship(back_populates="user")
    watchlist: list[Watchlist] = Relationship(back_populates="user")


    def set_password(self, password):
        self.password_hash = pwd_context.hash(password)

    def verify_password(self, password):
        return pwd_context.verify(password, self.password_hash)  

class UserOutput(SQLModel):
    id: int
    username: str
    balance: float
    transactions: list[TransactionOutput] = []
    portfolio: list[PortfolioOutput] = []

