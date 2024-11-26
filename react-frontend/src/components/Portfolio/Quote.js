import React, { useState } from "react";
import Navbar from "../Navbar";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import "../styles/Quote.css";

// Register required components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);


function GetQuote() {
    const [symbol, setSymbol] = useState("");
    const [quote, setQuote] = useState(null);
    const [error, setError] = useState(null);
    const [history, setHistory] = useState(null);

    async function fetchQuote() {
        try {
            setError(null);
            setQuote(null);
            setHistory(null);

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
            setQuote(data);

            // Fetch historical data
            const historyResponse = await fetch(`http://localhost:8000/api/portfolio/quote/${symbol}/history`);
            if (!historyResponse.ok) {
                const historyData = await historyResponse.json();
                throw new Error(historyData.detail || "Failed to fetch historical data.");
            }

            const historyData = await historyResponse.json();
            setHistory(historyData.history);
        } catch (err) {
            setError(err.message || "An unexpected error occurred.");
        }
    }

    const chartData = {
        labels: history ? history.map((data) => data.date).reverse() : [],
        datasets: [
            {
                label: "Weekly Closing Price",
                data: history ? history.map((data) => data.price).reverse() : [],
                borderColor: "rgba(75,192,192,1)",
                fill: false,
            },
        ],
    };

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
                {history && (
                    <div className="chart-container">
                        <h2>Historical Weekly Prices (Last 52 Weeks)</h2>
                        <Line data={chartData} />
                    </div>
                )}
            </div>
        </>
    );
}

export default GetQuote;
