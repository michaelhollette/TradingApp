import React, { useState } from "react";
import Navbar from "../Navbar";
import "../styles/Sell.css";

function SellStock() {
    const [stock, setStock] = useState("");
    const [quantity, setQuantity] = useState(0);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    async function handleSellStock(event) {
        event.preventDefault();
        setError(null); // Reset error messages
        setResult(null); // Reset previous results

        if (!stock || quantity <= 0) {
            setError("Please enter a valid stock symbol and quantity greater than 0.");
            return;
        }

        try {
            const response = await fetch("http://localhost:8000/api/transaction/sell", {
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
                throw new Error(data.detail || "Failed to sell stock.");
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
            <div className="sell-stock-container">
                <h1>Sell Stock</h1>
                <form className="sell-stock-form" onSubmit={handleSellStock}>
                    <div className="form-group">
                        <label>Stock Symbol:</label>
                        <input
                            type="text"
                            value={stock}
                            onChange={(e) => setStock(e.target.value)}
                            placeholder="Enter stock symbol (e.g., AAPL)"
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
                    <button type="submit">Sell Stock</button>
                </form>
                {error && <p className="error">{error}</p>}
                {result && (
                    <div className="result">
                        <h2>Stock Sold Successfully!</h2>
                        <p><strong>Stock:</strong> {result.portfolio?.stock || "N/A"}</p>
                        <p><strong>Quantity:</strong> {result.portfolio?.quantity || 0}</p>
                        {result.portfolio && (
                            <p><strong>Average Price:</strong> ${result.portfolio.price.toFixed(2)}</p>
                        )}
                        <h3>Updated Balance</h3>
                        <p>${result.balance.toFixed(2)}</p>
                    </div>
                )}
            </div>
        </>
    );
}

export default SellStock;
