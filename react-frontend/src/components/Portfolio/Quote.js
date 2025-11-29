import React, { useState } from "react";
import Navbar from "../Navbar";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import "../styles/Quote.css";
import QuoteView from "./QuoteView";
// Register required components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);


function Quote() {
    const [symbol, setSymbol] = useState("");
    const [quote, setQuote] = useState(null);
    const [error, setError] = useState(null);
    const [history, setHistory] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [showCompanies, setShowCompanies] = useState(false);
    const [companies, setCompanies] = useState([]);
    const [isLoading, setIsLoading] = useState(false);


    async function fetchQuote(symbolInput = symbol) {
        try {
            // Resets values and messages 
            setIsLoading(true)
            setError(null);
            setQuote(null);
            setHistory(null);
            setSuccessMessage(null);

            // Error handling
            if (!symbolInput) {
                setError("Please enter a stock symbol.");
                return;
            }

            // Fetches price and company data
            const response = await fetch(`http://localhost:8000/api/quote/${symbolInput}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || "Failed to fetch stock quote.");
            }

            const data = await response.json();
            setQuote(data);

            // Fetches historical price data
            const historyResponse = await fetch(`http://localhost:8000/api/quote/${symbolInput}/history`);
            if (!historyResponse.ok) {
                const historyData = await historyResponse.json();
                throw new Error(historyData.detail || "Failed to fetch historical data.");
            }

            const historyData = await historyResponse.json();
            setHistory(historyData.history);
        } catch (err) {
            setError(err.message || "An unexpected error occurred.");
        }finally{
            setIsLoading(false);
        }
    }

    // Function for add to watchlist button
    async function addToWatchlist(){
        try{
            // Resets messages
            setError(null);
            setSuccessMessage(null);

            // Error handling
            if(!quote){
                setError("No stock to add to  watchlist");
                return;
            }
            console.log("Quote: ", quote)
            
            // Fetches watchlist itemsand data
            const response = await fetch("http://localhost:8000/api/watchlist",{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
                
                body: JSON.stringify({ stock: quote.symbol, name: quote.name, image_url: quote.logo }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || "Failed to add stock to watchlist.");
            }

            setSuccessMessage(`Successfully added ${quote.name} (${quote.symbol}) to your watchlist.`);
        } catch (err) {
            setError(err.message || "An unexpected error occurred.");
        }
        
    }

     // Fetchs biggest companies 
     async function fetchCompanies() {
        try {
            setError(null);

            const response = await fetch(
                "https://financialmodelingprep.com/api/v3/stock-screener?exchange=NASDAQ&limit=100&order=marketCap&apikey=tXI3IbsvZVPvZhdlB7iyGUbf4YYQJKiZ"
            );

            if (!response.ok) {
                throw new Error("Failed to fetch NASDAQ companies.");
            }

            const data = await response.json();

            const filteredData = data.filter(
                (company) =>
                    company.price !== null &&
                    company.price !== undefined &&
                    company.marketCap !== null &&
                    company.marketCap !== undefined
            );
            setCompanies(filteredData);
            setShowCompanies(true);
        } catch (err) {
            setError(err.message || "An unexpected error occurred.");
        }
    }

    // Chart options

    return (
        <>
            <Navbar />
            <QuoteView
            symbol ={symbol}
            setSymbol ={setSymbol}
            quote = {quote}
            history = {history}
            error = {error}
            successMessage = {successMessage}
            companies = {companies}
            showCompanies ={showCompanies}
            isLoading = {isLoading}

            fetchQuote={fetchQuote}
            addToWatchlist = {addToWatchlist}
            fetchCompanies={fetchCompanies}
            hideCompanies={() => setShowCompanies(false)}
            />
        </>
    );

}
export default Quote;
