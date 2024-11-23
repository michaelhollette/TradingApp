import React, { useEffect, useState } from "react";
import Navbar from "../Navbar"; // Import Navbar component

import "../styles/Portfolio.css";

function Portfolio() {
    const [portfolio, setPortfolio] = useState([]);
    const [balance, setBalance] = useState(0);
    const [error, setError] = useState(null);

    async function fetchUserData() {
        try {
            // Fetch user data (including balance)
            const userResponse = await fetch("http://localhost:8000/api/auth/me", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
            });

            if (!userResponse.ok) {
                throw new Error("Failed to fetch user data");
            }

            const userData = await userResponse.json();
            setBalance(userData.balance); // Update the balance

            // Fetch portfolio data
            const portfolioResponse = await fetch("http://localhost:8000/api/portfolio/", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
            });

            if (!portfolioResponse.ok) {
                throw new Error("Failed to fetch portfolio data");
            }

            const portfolioData = await portfolioResponse.json();
            setPortfolio(portfolioData);
        } catch (err) {
            setError(err.message);
        }
    }

    const calculateTotalValue = () => {
        return portfolio.reduce((total, stock) => total + stock.quantity * stock.price, 0).toFixed(2);
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    return (
        <>
        <Navbar/>
                   
        <div className="portfolio-container">
            <h1>User Portfolio</h1>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <table className="portfolio-table">
                <thead>
                    <tr>
                        <th>Stock Symbol</th>
                        <th>Company</th>
                        <th>Quantity</th>
                        <th>Average Price</th>
                        <th>Total Price</th>
                    </tr>
                </thead>
                <tbody>
                    {portfolio.map((stock) => (
                        <tr key={stock.id}>
                            <td>{stock.stock}</td>
                            <td>{stock.name}</td>
                            <td>{stock.quantity}</td>
                            <td>${stock.price.toFixed(2)}</td>
                            <td>${(stock.quantity * stock.price).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan="4">Total Stock Value</td>
                        <td>${calculateTotalValue()}</td>
                    </tr>
                    <tr>
                        <td colSpan="4">Balance</td>
                        <td>${parseFloat(balance).toFixed(2)}</td>
                    </tr>
                </tfoot>
            </table>
        </div>
        </>
    );
}

export default Portfolio;
