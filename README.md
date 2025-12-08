![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![React](https://img.shields.io/badge/React-18-blue)
![Docker](https://img.shields.io/badge/Docker-ready-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)

# Szellit Marketplace

A simple "adok-veszek" style web marketplace for listing and discovering items - mainly targeted at SZE (Széchenyi István University) students.

## 🧾 Project Overview

Szellit is a community-based buy-and-sell platform. Users can:

- Browse listed items
- Sign in to create, edit, or manage listings
- More features (post new item, search/filter items, and more) coming soon...

## 🛠️ Tech Stack

- Frontend: [React](https://reactjs.org/) / [Express.js](https://expressjs.com/) / HTML / CSS / [Tailwind](https://tailwindcss.com/docs/installation/using-vite)
- Backend: (To be added - Node.js / Express )
- Auth: (Mention provider if used – Firebase Auth, NextAuth, etc.)
- Hosting: (e.g., Vercel, Netlify, Local only for now)

## 📦 Project Setup (Local Development)

### 1. Clone the Repository

```bash
git clone https://github.com/Botilazar/SZELLIT.git
cd SZELLIT
```

### 2. Install Dependencies

```bash
cd client/ && npm install
cd ../server/ && npm install
cd ..
```

### 3. Start the Development Server

Run separate terminals for FE and BE:

```bash
#Terminal 1
cd client/
npm run dev
#Terminal 2
cd server/
npm run dev
```

Then open:

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## Run with Docker Compose

Make sure you have Docker Desktop installed, then run:

```bash
docker compose build
docker compose up
```

This will:

- Build and start the frontend, backend, and the PostgreSQL containers.
- Automatically load the initial database dump from initdb/ folder.

To stop everything:

```bash
docker compose down
```

## 👨‍💻 Contribution Guide

1. Fork the repo and create your branch:

```bash
git checkout -b feature/your-feature
```

2. Make your changes
3. Commit and push:

```bash
git commit -m 'Add some feature'
git push origin feature/your-feature
```

4. Open a Pull Request to `main`.

## ✅ To-Do / Roadmap (OUTDATED)

- [x] Landing Page
- [x] Sign In Page
- [ ] User Auth
- [ ] Item Listing Creation
- [ ] Search and Filters

## License

MIT License © 2025 — Szellit Project Team
