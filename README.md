# TradingApp

 

A stock trading platform where you can buy/sell stocks, track your portfolio, and keep an eye on watchlists — all with real-time market data.

 

Built with React + FastAPI + SQLite.

 

Python: 3.12
React: 18
FastAPI: 0.115
 

## Features

 

- **Trading** — Buy and sell stocks with real-time pricing

- **Portfolio** — View your holdings, average cost, and current market value

- **Watchlists** — Track stocks you're interested in with historical price charts

- **Transaction history** — Full log of all your buys and sells

- **Stock quotes** — Company details, sector info, market cap, and more

 

## Tech Stack

 

| Layer | Tech |

|-------|------|

| Frontend | React, Material-UI, Highcharts, Tailwind CSS |

| Backend | Python, FastAPI, SQLModel/SQLAlchemy |

| Database | SQLite |

| Market Data | Finnhub, FMP, Twelve Data, AlphaVantage |

| Deployment | Docker, Nginx |

 

## Getting Started

### Docker (recommended)
**bash
docker-compose up --build


Frontend runs on
### Local dev


**Backend:**
•bash cd python-backend
pip install -r requirements.txt uvicorn app:app--reload
http://localhost:3000, backend on http://localhost: 8000°


**Frontend:**
***bash cd react-frontend npm install
npm
start
### API Keys




### API Keys

 

You'll need API keys for the market data providers. Set them up in your environment or a `.env` file in `python-backend/`:

 

- `FINNHUB_API_KEY`

- `FMP_API_KEY`

- `TWELVE_DATA_API_KEY`

- `ALPHA_VANTAGE_API_KEY`

 

## Project Structure

 

```

python-backend/

  app.py              # FastAPI entry point

  schemas.py          # DB models (User, Transaction, Portfolio, Watchlist)

  routes/             # API route handlers

  financial_data/     # Market data service layer

 

react-frontend/

  src/

    components/

      Auth/            # Login & registration

      Portfolio/       # Portfolio view, stock quotes

      Transactions/    # Buy, sell, history

      Watchlist/       # Watchlist management

    services/          # API client functions

```

 

## API Overview

 

| Method | Endpoint | Description |

|--------|----------|-------------|

| POST | `/api/auth/register` | Create account |

| POST | `/api/auth/token` | Login |

| GET | `/api/portfolio/` | Get holdings |

| GET | `/api/portfolio/quote/{symbol}` | Stock quote |

| POST | `/api/transaction/buy` | Buy stock |

| POST | `/api/transaction/sell` | Sell stock |

| GET | `/api/transaction/history` | Trade history |

| GET | `/api/watchlist/` | Get watchlist |

| POST | `/api/watchlist/` | Add to watchlist |

 

 

