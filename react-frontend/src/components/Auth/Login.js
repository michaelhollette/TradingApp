import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import logo from "../images/logo.png"; 

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    async function handleLogin(event) {
        event.preventDefault();
        setError(null);

        if (!username || !password) {
            setError("Username and password are required.");
            return;
        }

        try {
            const response = await fetch("http://localhost:8000/api/auth/token", {
                method: "POST",
                headers: {
                    // Encodes the data in form data for OAuth2.0 rather than sending it in JSON
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                // URLSearchParams is a built in Javascript 
                body: new URLSearchParams({
                    username: username,
                    password: password,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || "Login failed.");
            }

            const data = await response.json();
            localStorage.setItem("accessToken", data.access_token);
            alert("Login successful!");
            navigate("/portfolio");
        } catch (err) {
            setError(err.message || "An unexpected error occurred.");
        }
    }

    return (
        <div className="login-container">
            {/* Logo Section */}
            <div className="logo-section">
                <img src={logo} alt="MultiTrader Logo" className="logo" />
            </div>

            {/* Login Form Section */}
            <div className="login-form-section">
                <h1 className="login-header">Login</h1>
                {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
                <form className="login-form" onSubmit={handleLogin}>
                    <div>
                        <label>Username:</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div>
                        <label>Password:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit">Login</button>
                </form>
                <button
                    className="back-home-button"
                    onClick={() => navigate("/")}
                >
                    Back to Home
                </button>
            </div>
        </div>
    );
}

export default Login;
