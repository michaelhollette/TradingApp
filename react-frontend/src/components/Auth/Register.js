import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Register.css";
import logo from "../images/logo.png"; 


function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    async function handleRegister(event) {
        event.preventDefault();
        setError(null);

        if (!username || !password || !confirmPassword) {
            setError("All fields are required.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            const response = await fetch("http://localhost:8000/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || "Registration failed.");
            }

            const data = await response.json();
            alert(data.message); 
            navigate("/login"); 
        } catch (err) {
            setError(err.message || "An unexpected error occurred.");
        }
    }

    return (
        <div className="register-container">
            {/* Logo Section */}
            <div className="logo-section">
                <img src={logo} alt="MultiTrader Logo" className="logo" />
            </div>

            {/* Register Form Section */}
            <div className="register-form-section">
                <h1 className="register-header">Register</h1>
                {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
                <form className="register-form" onSubmit={handleRegister}>
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
                    <div>
                        <label>Confirm Password:</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit">Register</button>
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

export default Register;
