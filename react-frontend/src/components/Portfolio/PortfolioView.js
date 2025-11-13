import React, { useState } from "react";

import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import Highcharts3D from "highcharts/highcharts-3d";
import "../styles/Portfolio.css";

Highcharts3D(Highcharts);

function PortfolioView({ isLoading, error, portfolio, balance, totalValue, totalUnrealized }) {
    const [showModal, setShowModal] = useState(false);
    const handleShowModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);

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
                    name: stock.company,
                    y: stock.quantity * stock.avg_price_paid,
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
    

  if (isLoading) return <div className="portfolio-container offset-navbar">Loading portfolio...</div>;
  if (error) return <div className="portfolio-container offset-navbar" style={{ color: "red" }}>{error}</div>;

 return (
    <div className="portfolio-container offset-navbar">
      <h1>User Portfolio</h1>

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
              <td>{stock.symbol}</td>
              <td>{stock.company}</td>
              <td>{stock.quantity}</td>
              <td>${stock.avg_price_paid.toFixed(2)}</td>
              <td>${(stock.quantity * stock.avg_price_paid).toFixed(2)}</td>
              <td>${stock.current_price.toFixed(2)}</td>
              <td style={{ color: stock.unrealized_gain_loss > 0 ? "green" : "red" }}>
                ${stock.unrealized_gain_loss}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="4">Total Stock Value</td>
            <td>${totalValue}</td>
            <td colSpan="2"></td>
          </tr>
          <tr>
            <td colSpan="6">Total Unrealized Gain/Loss</td>
            <td style={{ color: totalUnrealized > 0 ? "green" : "red" }}>${totalUnrealized}</td>
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
                xAxis: {
                  categories: portfolio.map((stock) => stock.symbol),
                  labels: { style: { color: "#f5f5f5" } },
                },
                yAxis: {
                  title: { text: "Profit/Loss ($)", style: { color: "#f5f5f5" } },
                },
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
        <HighchartsReact highcharts={Highcharts} options={chartOptions} />
      </div>

      <button onClick={handleShowModal} className="show-insight-button">
        Show Profit Insights
      </button>
    </div>
  );
};

export default PortfolioView;