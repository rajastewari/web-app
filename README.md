# Web App

A full stack web app with session-based authentication. Planning to build practical features on top of the login and registration foundation.

## Features

- Create an account with a username and password
- Log in and receive a session token stored in Redis
- Passwords are hashed with bcrypt and session tokens expire after 24 hours or on logout

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express
- **Database:** PostgreSQL (user storage)
- **Cache:** Redis (session tokens)
- **Containerization:** Docker, Docker Compose

## How to Run

Requires Docker Desktop and must be run locally. Website will be hosted with some free service later.
