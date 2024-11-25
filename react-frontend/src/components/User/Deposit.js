import React, { useState } from "react";
import Navbar from "../Navbar";
import "../styles/Deposit.css";

function DepositFunds() {
    const [amount, setAmount] = useState("");
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    async function handleDeposit(event) {
        event.preventDefault();
        setError(null);
        setResult(null);

        if (!amount || parseFloat(amount) <= 0) {
            setError("Please enter a valid amount greater than 0.");
            return;
        }

        try {
            const response = await fetch("http://localhost:8000/api/user/add-funds", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
                body: JSON.stringify({ amount: parseFloat(amount) }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || "Failed to add funds.");
            }

            const data = await response.json();
            setResult(data); // Update the result with the response message
        } catch (err) {
            setError(err.message || "An unexpected error occurred.");
        }
    }

    return (
        <>
            <Navbar />
            <div className="deposit-funds-container">
                <h1>Deposit Funds</h1>
                <form className="deposit-form" onSubmit={handleDeposit}>
                    <div className="form-group">
                        <label>Amount:</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Enter amount"
                            min="1"
                        />
                    </div>
                    <button type="submit">Deposit</button>
                </form>
                {error && <p className="error">{error}</p>}
                {result && (
                    <div className="result">
                        <h2>{result.message}</h2>
                        <p><strong>New Balance:</strong> ${result.balance.toFixed(2)}</p>
                    </div>
                )}
            </div>
        </>
    );
}

export default DepositFunds;
