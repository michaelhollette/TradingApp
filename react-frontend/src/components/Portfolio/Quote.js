import React, { useState } from "react";
import Navbar from "../Navbar"; // Reuse your Navbar component
import "../styles/Quote.css";


function GetQuote() {
    const [symbol, setSymbol] = useState("");
    const [quote, setQuote] = useState(null);
    const [error, setError] = useState(null);

    async function fetchQuote() {
        try {
            setError(null); // Reset errors
            setQuote(null); // Reset previous quote data

            if (!symbol) {
                setError("Please enter a stock symbol.");
                return;
            }

            const response = await fetch(`http://localhost:8000/api/portfolio/quote/${symbol}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || "Failed to fetch stock quote.");
            }

            const data = await response.json();
            setQuote(data); // Update state with the stock quote data
        } catch (err) {
            setError(err.message || "An unexpected error occurred.");
        }
    }

    return (
        <>
            <Navbar />
            <div className="get-quote-container">
                <h1>Get Stock Quote</h1>
                <div className="form-container">
                    <input
                        type="text"
                        placeholder="Enter stock symbol"
                        value={symbol}
                        onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    />
                    <button onClick={fetchQuote}>Get Quote</button>
                </div>
                {error && <p className="error">{error}</p>}
                {quote && (
                    <div className="quote-details">
                        {quote.logo && (
                            <img
                                src={quote.logo}
                                alt={`${quote.name} Logo`}
                                className="company-logo"
                            />
                        )}
                        <h2>{quote.name} ({quote.symbol})</h2>
                        <p><strong>Price:</strong> ${quote.price.toFixed(2)}</p>
                        <p><strong>Exchange:</strong> {quote.exchange}</p>
                        <p><strong>Sector:</strong> {quote.sector}</p>
                        <p><strong>Industry:</strong> {quote.industry}</p>

                        <p><strong>Description:</strong> {quote.description}</p>
                    </div>
                )}
            </div>
        </>
    );
}

export default GetQuote;
