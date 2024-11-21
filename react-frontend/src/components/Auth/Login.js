import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

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
                    "Content-Type": "application/x-www-form-urlencoded",
                },
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
            // Store the token in localStorage for subsequent authenticated requests
            localStorage.setItem("accessToken", data.access_token);

            alert("Login successful!");
            navigate("/"); // Redirect to homepage after login
        } catch (err) {
            setError(err.message || "An unexpected error occurred.");
        }
    }

    return (
        <div>
            <h1>Login</h1>
            <form onSubmit={handleLogin}>
                {error && <p style={{ color: "red" }}>{error}</p>}
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
        </div>
    );
}

export default Login;
