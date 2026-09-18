# Web App

Built a full-stack web app for tracking stocks, crypto, and market indices in real time, with a customizable watchlist, portfolio valuation and performance charting, and live financial news.

## Features

- Create an account with a username and password
- View live stock and crypto news
- Track market indices in real time
- Customize a watchlist/portfolio with performance charting

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express
- **Database:** PostgreSQL, hosted on Neon
- **Cache:** Redis (session tokens, price/news caching)
- **Containerization:** Docker

## Notes on Architecture

- `/login`, `/register`, and `/welcome` handle account creation, login, and session verification. Login tokens are cached in Redis for 24 hours.
- Live pricing data for the ticker tape comes from the Finnhub API. 
- News feeds are pulled by parsing CNBC's and CoinDesk's RSS feeds, cached in Redis for 10 minutes.
- Every user is assigned a role (free/premium/admin) in Postgres to create a role-based access (RBAC) system.
- RESTful backend built with Node.js and Express, containerized with Docker.

## Host

The entire application runs in a Docker container hosted on Render. The Postgres database is hosted on Neon.

The `docker-compose.yml` file is used to run my application in separate containers, but can only be run locally. Render doesn't support multiple containers at all, so the Dockerfile is the container that is hosted on Render.