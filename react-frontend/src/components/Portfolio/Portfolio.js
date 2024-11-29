import React, { useEffect, useState } from "react";
import Navbar from "../Navbar";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import Highcharts3D from "highcharts/highcharts-3d";
import "../styles/Portfolio.css";


// Makes charts 3d
Highcharts3D(Highcharts);


function Portfolio() {
    const [portfolio, setPortfolio] = useState([]);
    const [balance, setBalance] = useState(0);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const handleShowModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);


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

            // Fetches current prices 
            const portfolioData = await portfolioResponse.json();
            const symbols = portfolioData.map((stock) => stock.stock).join(",");
            const pricesResponse = await fetch(`https://financialmodelingprep.com/api/v3/quote/${symbols}?apikey=tXI3IbsvZVPvZhdlB7iyGUbf4YYQJKiZ`);
            if (!pricesResponse.ok) {
                throw new Error("Failed to fetch current stock prices");
            }

            const pricesData = await pricesResponse.json();
            const updatedPortfolio = portfolioData.map((stock) => {
                const currentPrice = pricesData.find((price) => price.symbol === stock.stock)?.price || stock.price;
                const unrealizedGainLoss = ((currentPrice - stock.price) * stock.quantity).toFixed(2);
                return { ...stock, current_price: currentPrice, unrealized_gain_loss: unrealizedGainLoss };
            });

            // Loads portfolio data
            setPortfolio(updatedPortfolio)
        } catch (err) {
            setError(err.message);
        }
    }

    // For each element in array it does {Current accumulated total} += {Quantity * price}
    const calculateTotalValue = () => {
        return portfolio.reduce((total, stock) => total + stock.quantity * stock.price, 0).toFixed(2);
    };

    // Chart settings
    const chartOptions = {
        chart: {
            type: "pie",
            backgroundColor: "#121212",
            options3d: {
                enabled: true,
                alpha: 45,
                beta: 0,
            },
            width: 1200, 
            height:400,
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
                    format: "{point.name}: {point.percentage:.1f}%", 
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
                    "#00acee", // Light blue
                    "#00429B", // Navy
                    "#FF6384", // Red
                    "#FFCE56", // Yellow
                    "#4BC0C0", // Turquoise
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
                            <th>Current Price</th>
                            <th>Unrealized Gain/Loss</th>
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
                                <td>${stock.current_price.toFixed(2)}</td>
                                <td
                                    style={{
                                        color: stock.unrealized_gain_loss > 0 ? "green" : "red",
                                    }}
                                >
                                    ${stock.unrealized_gain_loss}
                                </td>
                                
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                    <tr>
                        <td colSpan="4">Total Stock Value</td>
                        <td>${calculateTotalValue()}</td>
                        <td colSpan="2"></td>
                    </tr>
                    <tr>
                        <td colSpan="6">Total Unrealized Gain/Loss</td>
                        <td
                            style={{
                                color:
                                    portfolio.reduce(
                                        (total, stock) =>
                                            total + parseFloat(stock.unrealized_gain_loss || 0),
                                        0
                                    ) > 0
                                        ? "green"
                                        : "red",
                            }}
                        >
                            $
                            {portfolio
                                .reduce(
                                    (total, stock) =>
                                        total + parseFloat(stock.unrealized_gain_loss || 0),
                                    0
                                )
                                .toFixed(2)}
                        </td>
                    </tr>
                    <tr>
                        <td colSpan="6">Balance</td>
                        <td>${parseFloat(balance).toFixed(2)}</td>
                    </tr>
                </tfoot>

                </table>

                

                {showModal && (
                    <div className="modal">
                        <div className="modal-content">
                            <button onClick={handleCloseModal} className="close-modal-button">
                                Close
                            </button>
                            <HighchartsReact
                                highcharts={Highcharts}
                                options={{
                                    chart: { type: "column", backgroundColor: "#121212" },
                                    title: { text: "Unrealized Gains/Losses", style: { color: "#f5f5f5" } },
                                    xAxis: { categories: portfolio.map((stock) => stock.stock), labels: { style: { color: "#f5f5f5" } } },
                                    yAxis: { title: { text: "Profit/Loss ($)", style: { color: "#f5f5f5" } } },
                                    series: [
                                        {
                                            name: "Profit/Loss",
                                            data: portfolio.map((stock) => parseFloat(stock.unrealized_gain_loss || 0)),
                                            color: "#00acee",
                                        },
                                    ],
                                    
                                }}
                            />
                        </div>
                    </div>
                )}


                <div className="chart-container">
                    <HighchartsReact
                        highcharts={Highcharts}
                        options={chartOptions}
                    />
                </div>

                
                <button onClick={handleShowModal} className="show-insight-button">
                    Show Profit Insights
                </button>

            </div>
        </>
    );
}

export default Portfolio;
