import React, {useState, useEffect} from "react";
import Navbar from "../Navbar";
import "../styles/Watchlist.css";
import { Line } from "react-chartjs-2";



function Watchlist(){
    const [watchlist, setWatchlist] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchWatchlist() {
            try {
                const response = await fetch("http://localhost:8000/api/watchlist", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch watchlist");
                }

                const data = await response.json();
                setWatchlist(data);
            } catch (err) {
                setError(err.message);
            }
        }
        fetchWatchlist();
    }, []);


    async function deleteItem(itemId) {
        try {
            const response = await fetch(`http://localhost:8000/api/watchlist/${itemId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to delete item");
            }

            setWatchlist(watchlist.filter((item) => item.id !== itemId));
        } catch (err) {
            setError(err.message);
        }
    }

    function renderChart(historicalData) {
        const sortedData = [...historicalData].reverse()
        const labels = sortedData.map((entry) => new Date(entry.date).toLocaleTimeString());
        const prices = sortedData.map((entry) => entry.price);

        return {
            labels,
            datasets: [
                {
                    label: "Price",
                    data: prices,
                    borderColor: "rgba(75,192,192,1)",
                    backgroundColor: "rgba(75,192,192,0.2)",
                    tension: 0.3,
                },
            ],
        };
    }
    return (
        <>
            <Navbar />
            <div className="watchlist-container">
                <h1>Watchlist</h1>
                {error && <p className="error">{error}</p>}
                {watchlist.length === 0 && !error && <p>Your watchlist is empty.</p>}
                {watchlist.map((item) => (
                    <div key={item.id} className="watchlist-item">
                        <div className="watchlist-header">
                            <div className="watchlist-details">
                                <h2>{item.name} ({item.stock})</h2>
                                <p>Current Price: ${item.current_price}</p> 
                            </div>
                            <button className = "delete-button" onClick={() => deleteItem(item.id)}>Remove</button>
                        </div>
                        {item.historical_price ? (
                            <div className="chart-container">
                                <Line data={renderChart(item.historical_price)} />
                            </div>
                        ) : (
                            <p>Historical data unavailable</p>
                        )}
                    </div>
                ))}
            </div>
        </>
    );

}

export default Watchlist;