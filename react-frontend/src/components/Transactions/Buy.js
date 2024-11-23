import React, { useState } from "react";
import Navbar from "../Navbar";
import "../styles/Buy.css";

function BuyStock() {
    const [stock, setStock] = useState("");
    const [quantity, setQuantity] = useState(0);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    async function handleBuyStock(event) {
        event.preventDefault();
        setError(null); // Reset error messages
        setResult(null); // Reset previous results

        if (!stock || quantity <= 0) {
            setError("Please enter a valid stock symbol and quantity greater than 0.");
            return;
        }

        try {
            const response = await fetch("http://localhost:8000/api/transaction/buy", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
                body: JSON.stringify({
                    stock: stock.toUpperCase(),
                    quantity: quantity,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || "Failed to buy stock.");
            }

            const data = await response.json();
            setResult(data); // Show the result to the user
        } catch (err) {
            setError(err.message || "An unexpected error occurred.");
        }
    }

    return (
        <>
            <Navbar />
            <div className="buy-stock-container">
                <h1>Buy Stock</h1>
                <form className="buy-stock-form" onSubmit={handleBuyStock}>
                    <div className="form-group">
                        <label>Stock Symbol:</label>
                        <input
                            type="text"
                            value={stock}
                            onChange={(e) => setStock(e.target.value)}
                            placeholder="Enter stock symbol"
                        />
                    </div>
                    <div className="form-group">
                        <label>Quantity:</label>
                        <input
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            placeholder="Enter quantity"
                            min="1"
                        />
                    </div>
                    <button type="submit">Buy Stock</button>
                </form>
                {error && <p className="error">{error}</p>}
                {result && (
                    <div className="result">
                        <h2>Stock Purchased Successfully!</h2>
                        
                        <p><strong>Stock:</strong> {result.transaction.stock}</p>
                        <p><strong>Price per share:</strong> ${result.transaction.price.toFixed(2)}</p>
                        <p><strong>Quantity:</strong> {result.transaction.quantity}</p>
                        <br></br>
                        <h3>Updated Portfolio</h3>
                        <p><strong>Stock:</strong> {result.portfolio.stock}</p>
                        <p><strong>Company:</strong> {result.portfolio.name}</p>
                        <p><strong>Quantity:</strong> {result.portfolio.quantity}</p>
                        <p><strong>Average Price:</strong> ${result.portfolio.price.toFixed(2)}</p>
                        <br></br>
                        <h3>Updated Balance</h3>
                        <p>${result.balance.toFixed(2)}</p>
                    </div>
                )}
            </div>
        </>
    );
}

export default BuyStock;
