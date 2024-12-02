import React, { useState, useEffect } from "react";
import Navbar from "../Navbar";
import "../styles/History.css"


function TransactionHistory(){
    const[history, setHistory] = useState([])
    const [error, setError] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });


    useEffect(() => {
        async function fetchHistory() {
            try {
                setError(null);
                const historyResponse = await fetch("http://localhost:8000/api/transaction/history", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                });
    
                if (!historyResponse.ok) {
                    const data = await historyResponse.json();
                    throw new Error(data.detail || "Failed to fetch transaction history.");
                }
    
                const historyData = await historyResponse.json();
    
                // Add a `totalPrice` field to each transaction
                const enrichedData = historyData.map(transaction => ({
                    ...transaction,
                    totalPrice: transaction.price * transaction.quantity,
                }));
    
                setHistory(enrichedData);
            } catch (err) {
                setError(err.message);
            }
        }
        fetchHistory();
    }, []);
    

    const sortData = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc"; 
        }
    
        const sortedData = [...history].sort((a, b) => {
            if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
            if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
            return 0;
        });
    
        setSortConfig({ key, direction });
        setHistory(sortedData);
    };
    

    
    return (
        <>
            <Navbar />
            <div className="transaction-history-container">
                <h1>Transaction History</h1>
                {error && <p className="error">{error}</p>}
                {!error && history.length === 0 && <p>No transactions found.</p>}
                {history.length > 0 && (
                    <div className="transaction-table-container">
                        <table className="transaction-table">
                        <thead>
                            <tr>
                                <th onClick={() => sortData("stock")}>Stock</th>
                                <th onClick={() => sortData("type")}>Type</th>
                                <th onClick={() => sortData("quantity")}>Quantity</th>
                                <th onClick={() => sortData("price")}>Price</th>
                                <th onClick={() => sortData("totalPrice")}>Total Price</th> 
                                <th onClick={() => sortData("timestamp")}>Date</th>
                                <th>Time</th>
                            </tr>
                        </thead>

                            <tbody>
                                {history.map((transaction) => {
                                    const timestamp = new Date(transaction.timestamp);
                                    const date = timestamp.toLocaleDateString();
                                    const time = timestamp.toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    });

                                    return (
                                        <tr key={transaction.id}>
                                            <td>{transaction.stock}</td>
                                            <td>{transaction.type}</td>
                                            <td>{transaction.quantity}</td>
                                            <td>${transaction.price.toFixed(2)}</td>
                                            <td>${(transaction.price * transaction.quantity).toFixed(2)}</td>
                                            <td>{date}</td>
                                            <td>{time}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}

export default TransactionHistory;
    

    

 



