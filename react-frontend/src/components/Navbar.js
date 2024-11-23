import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./styles/Navbar.css";

function Navbar() {
    const [balance, setBalance] = useState(0);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    async function fetchBalance() {
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
            setBalance(userData.balance ? parseFloat(userData.balance).toFixed(2) : 0);
        } catch (err) {
            setError(err.message);
        }
    }

    useEffect(() => {
        fetchBalance()
       
    }, []);

    const handleLogout = () => {
        // Clear the token and balance from localStorage
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userBalance");
        alert("Logged out successfully!");
        navigate("/login"); // Redirect to login page
    };


    return (
        <nav className="navbar">
            <div className="navbar-links">
                <Link to="/portfolio">Portfolio</Link>
                <Link to="/quote">Get Quote</Link>
                <Link to="/buy">Buy Stock</Link>
                <Link to="/sell">Sell Stock</Link>
                <Link to="/history">Transaction History</Link>
                <Link to="/deposit">Deposit Funds</Link>
            </div>
            <div className="navbar-actions">
                <span className="balance">Balance: ${balance}</span>
                <button className="logout-button" onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </nav>
    );
}

export default Navbar;
