import React from 'react';
import { Link } from 'react-router-dom';
import '../styles.css';
import logo from './images/logo.png'; 
import globe from './images/globe.png'; 
import "./styles/Home.css"

function Homepage({ welcome }) {
    return (
        <div className="homepage-container">
            <div className="logo-container">
                <img src={logo} alt="MultiTrader Logo" className="logo" />
            </div>

            <div className="welcome-section">
                <h1>{welcome.message || "Welcome to MultiTrader"}</h1>
                <p>Join the world of professional trading. Buy, sell, and manage your portfolio with ease.</p>
                <div className="button-container">
                    <button>
                        <Link to="/login">Login</Link>
                    </button>
                    <button>
                        <Link to="/register">Register</Link>
                    </button>
                </div>
            </div>

            <div className="globe-container">
                <img src={globe} alt="Globe Representing Finance" className="globe-image" />
            </div>
        </div>
    );
}

export default Homepage;
