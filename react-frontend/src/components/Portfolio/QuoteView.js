import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import "../styles/Quote.css";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function QuoteView({ 
    symbol,
    setSymbol,
    quote, 
    history, 
    error, 
    successMessage,
    companies,
    showCompanies,      
    isLoading,


    fetchQuote,
    addToWatchlist,
    fetchCompanies,
    hideCompanies,
 }) {

    
    // Chart options
    const chartData = {
        //x-axis
        labels: history 
            ? history.map((h) => {
                // Converts string to Date data type and formats
                const date = new Date(h.date);
                return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`; 
            }).reverse() 
            : [],
        datasets: [
            {
                label: "Daily Closing Price",
                data: history ? history.map((h) => h.close).reverse() : [],
                borderColor: "rgba(75,192,192,1)",
                fill: false,
            },
        ],
    };
    
    return (
        <>
            <div className="get-quote-container">
                <h1>Get Stock Quote</h1>
                <div className="form-container">
                    <input
                        type="text"
                        placeholder="Enter stock symbol"
                        value={symbol}
                        onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    />
                    <button onClick={() => fetchQuote(symbol)}>Get Quote</button>
                </div>

                {isLoading && <p>Loading...</p>}
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
                <button onClick={showCompanies ? () => hideCompanies : fetchCompanies}>
                    {showCompanies ? "Hide Biggest NASDAQ Companies" : "Show Biggest NASDAQ Companies"}
                </button>
                {showCompanies && companies.length > 0 && (
                    <div className="companies-table">
                        <h2>Biggest 100 NASDAQ Companies</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Name</th>
                                    <th>Symbol</th>
                                    <th>Price</th>
                                    <th>Market Cap</th>
                                </tr>
                            </thead>
                            <tbody>
                                {companies.map((company, index) => (
                                    <tr key={company.symbol}>
                                        <td>{index + 1}</td>
                                        <td>{company.companyName}</td>
                                        <td>
                                            <button
                                                className="symbol-link"
                                                onClick={() => {
                                                    setSymbol(company.symbol); 
                                                    fetchQuote(company.symbol); }}
                                            >
                                                {company.symbol}
                                            </button>
                                        </td>
                                        <td>${company.price.toFixed(2)}</td>
                                        <td>${(company.marketCap / 1e9).toFixed(2)} B</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

            </div>
        </>
    );
  
}

export default QuoteView;