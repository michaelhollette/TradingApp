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
    const [successMessage, setSuccessMessage] = useState(null);


    async function fetchQuote() {
        try {
            setError(null);
            setQuote(null);
            setHistory(null);
            setSuccessMessage(null);


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

    async function addToWatchlist(){
        try{
            setError(null);
            setSuccessMessage(null);

            if(!quote){
                setError("No stock to add to  watchlist");
                return;
            }
            console.log("Quote: ", quote)

            const response = await fetch("http://localhost:8000/api/watchlist",{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
                
                body: JSON.stringify({ stock: quote.symbol, name: quote.name, image_url: quote.logo }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || "Failed to add stock to watchlist.");
            }

            setSuccessMessage(`Successfully added ${quote.name} (${quote.symbol}) to your watchlist.`);
        } catch (err) {
            setError(err.message || "An unexpected error occurred.");
        }
        
    }

    const chartData = {
        labels: history 
            ? history.map((data) => {
                const date = new Date(data.date); // Convert to Date object
                return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`; // Format as MM/DD/YYYY
            }).reverse() 
            : [],
        datasets: [
            {
                label: "Daily Closing Price",
                data: history ? history.map((data) => data.close).reverse() : [],
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
                {successMessage && <p className="success">{successMessage}</p>}
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
                        <p><strong>Market Cap:</strong> ${Number(quote.market_cap).toLocaleString("en-US")}</p>

                        <p><strong>Exchange:</strong> {quote.exchange}</p>
                        <p><strong>Sector:</strong> {quote.sector}</p>
                        <p><strong>Industry:</strong> {quote.industry}</p>
                        <p><strong>Description:</strong> {quote.description}</p>
                        <p><strong>Address:</strong> {quote.address}</p>

                        <button className="watchlist-button" onClick={addToWatchlist}>
                            Add to Watchlist
                        </button>
                    </div>
                )}
                {history && (
                    <div className="chart-container">
                        <h2>Historical Daily Prices (Last 30 Day)</h2>
                        <Line data={chartData} />
                    </div>
                )}
            </div>
        </>
    );

}
export default GetQuote;
