import React, { useEffect, useState } from "react";
import Navbar from "../Navbar";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import Highcharts3D from "highcharts/highcharts-3d";
import "../styles/Portfolio.css";


// Makes the charts 3d
Highcharts3D(Highcharts);


function Portfolio() {
    const [portfolio, setPortfolio] = useState([]);
    const [balance, setBalance] = useState(0);
    const [error, setError] = useState(null);

    async function fetchUserData() {
        try {
            // Fetches user data
            const userResponse = await fetch("http://localhost:8000/api/auth/me", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
            });

            if (!userResponse.ok) {
                throw new Error("Failed to fetch user data");
            }

            const userData = await userResponse.json();
            setBalance(userData.balance);

            // Fetches portfolio data
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

    const chartOptions = {
        chart: {
            type: "pie",
            backgroundColor: "#121212",
            options3d: {
                enabled: true,
                alpha: 45,
                beta: 0,
            },
            width: 900, // Set the desired width
            height:400, // Set the desired height
        },
        title: {
            text: "Portfolio Allocation",
            style: {
                color: "#f5f5f5",
                fontSize: "24px",
            },
        },
        tooltip: {
            pointFormatter: function () {
                return `<b>${this.name}</b>: $${this.y.toFixed(2)} (${this.percentage.toFixed(2)}%)`;
            },
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: "pointer",
                depth: 35,
                dataLabels: {
                    enabled: true,
                    format: "{point.name}: {point.percentage:.1f}%", // Show percentage
                    style: {
                        color: "#f5f5f5",
                        fontSize: "14px",
                    },
                },
            },
        },
        series: [
            {
                name: "Portfolio Value",
                data: portfolio.map((stock) => ({
                    name: stock.name,
                    y: stock.quantity * stock.price,
                })),
                colors: [
                    "#00acee", // Primary color
                    "#00429B", // Blue
                    "#FF6384", // Red
                    "#FFCE56", // Yellow
                    "#4BC0C0", // Teal
                    "#9966FF", // Purple
                ],
            },
        ],
        legend: {
            itemStyle: {
                color: "#f5f5f5",
                fontSize: "14px",
            },
        },
    };
    
    
    
    useEffect(() => {
        fetchUserData();
    }, []);

    return (
        <>
            <Navbar />
            <div className="portfolio-container offset-navbar">
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

                {/* Add the 3D Pie Chart below the table */}
                <div className="chart-container">
                    <HighchartsReact
                        highcharts={Highcharts}
                        options={chartOptions}
                    />
                </div>

            </div>
        </>
    );
}

export default Portfolio;
