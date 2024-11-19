from sqlmodel import SQLModel, Field, Relationship, Column, VARCHAR
from passlib.context import CryptContext


pwd_context = CryptContext(schemes=['bcrypt'])

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
    timestamp: str




class Portfolio(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    stock: str
    quantity: int
    price: float
    user_id: int = Field(foreign_key="user.id")
    user: "User" = Relationship(back_populates="portfolio")

class PortfolioOutput(SQLModel):
    id: int
    stock: str
    quantity: int
    price: float

class User(SQLModel, table=True):
    id: int | None = Field(primary_key=True, default=None)
    username: str = Field(sa_column=Column("username", VARCHAR, unique=True, index=True))  # Ensures uniqueness
    password_hash: str = ""
    balance: float | None = 0
    transactions: list[Transaction] = Relationship(back_populates="user")
    portfolio: list[Portfolio] = Relationship(back_populates="user")

    def set_password(self, password):
        self.password_hash = pwd_context.hash(password)

    def verify_password(self, password):
        return pwd_context.verify(password, self.password_hash)  # Fixed verify logic

class UserOutput(SQLModel):
    id: int
    username: str
    balance: float
    transactions: list[TransactionOutput] = []
    portfolio: list[PortfolioOutput] = []
