import React, { useEffect, useState } from "react";
import "../styles/Portfolio.css";

function Portfolio() {
    const [portfolio, setPortfolio] = useState([]);
    const [balance, setBalance] = useState(0);
    const [error, setError] = useState(null);

    // Fetch the portfolio data from the backend
    async function fetchPortfolio() {
        try {
            const response = await fetch("http://localhost:8000/api/portfolio/", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch portfolio data");
            }

            const data = await response.json();
            setPortfolio(data);

            // Extract the user's balance from the data
            const userBalance = localStorage.getItem("userBalance"); // Replace with API call if balance is stored elsewhere
            setBalance(userBalance || 0);
        } catch (err) {
            setError(err.message);
        }
    }

    // Calculate the total value of all stocks in the portfolio
    const calculateTotalValue = () => {
        return portfolio.reduce((total, stock) => total + stock.quantity * stock.price, 0).toFixed(2);
    };

    useEffect(() => {
        fetchPortfolio();
    }, []);

    return (
        <div className="portfolio-container">
            <h1>User Portfolio</h1>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <table className="portfolio-table">
                <thead>
                    <tr>
                        <th>Stock</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
                    {portfolio.map((stock) => (
                        <tr key={stock.id}>
                            <td>{stock.stock}</td>
                            <td>{stock.quantity}</td>
                            <td>${stock.price.toFixed(2)}</td>
                            <td>${(stock.quantity * stock.price).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan="3">Total Stock Value</td>
                        <td>${calculateTotalValue()}</td>
                    </tr>
                    <tr>
                        <td colSpan="3">Balance</td>
                        <td>${parseFloat(balance).toFixed(2)}</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
}

export default Portfolio;
