import React, { useEffect, useState } from "react";
import Navbar from "../Navbar";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import Highcharts3D from "highcharts/highcharts-3d";
import "../styles/Portfolio.css";
import PortfolioView from "./PortfolioView";

// Makes charts 3d
Highcharts3D(Highcharts);


const Portfolio = () =>{
    const [portfolio, setPortfolio] = useState([]);
    const [balance, setBalance] = useState(0);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);


    async function fetchUserData() {
        try {
            // Fetches user data
            setIsLoading(true);
            const token = localStorage.getItem("accessToken");

            const userResponse = await fetch("http://localhost:8000/api/auth/me", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!userResponse.ok) {
                throw new Error("Failed to fetch user data");
            }

            const userData = await userResponse.json();
            setBalance(userData.balance);

            // Fetches portfolio data
            const portfolioResponse = await fetch("http://localhost:8000/api/portfolio/full", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!portfolioResponse.ok) {
                throw new Error("Failed to fetch portfolio data");
            }

            // Fetches current prices 
            const portfolioData = await portfolioResponse.json();
            console.log("Portfolio Data: ", portfolioData);
            if (!portfolioData || portfolioData.length === 0) {
                setPortfolio([]);
            return;
            }


         
            const updatedPortfolio = portfolioData.map((stock) => {
                const unrealizedGainLoss = ((stock.current_price - stock.avg_price_paid) * stock.quantity).toFixed(2);
                return { ...stock, unrealized_gain_loss: unrealizedGainLoss };
            });

            // Loads portfolio data
            setPortfolio(updatedPortfolio)
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    // For each element in array it does {Current accumulated total} += {Quantity * price}
    const calculateTotalValue = () => {
        return portfolio.reduce((total, stock) => total + stock.quantity * stock.avg_price_paid, 0).toFixed(2);
    };

    
    useEffect(() => {
        fetchUserData();
    }, []);

    const totalUnrealized = portfolio
    .reduce((total, stock) => total + parseFloat(stock.unrealized_gain_loss || 0), 0)
    .toFixed(2);


    return (
        <>
            <Navbar />
            <PortfolioView
                isLoading={isLoading}
                error={error}   
                portfolio={portfolio}
                balance={balance}
                totalValue={calculateTotalValue()}
                totalUnrealized={totalUnrealized}
            />
       
        </>
    );
}

export default Portfolio;
