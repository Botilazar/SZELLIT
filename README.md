# Szellit Marketplace

A simple "adok-veszek" style web marketplace for listing and discovering items - mainly targeted at SZE (Széchenyi István University) students.

## 🧾 Project Overview

Szellit is a community-based buy-and-sell platform. Users can:
- Browse listed items
- Sign in to create, edit, or manage listings
- More features (post new item, search/filter items, and more) coming soon...

## 🛠️ Tech Stack
- Frontend: [React](https://reactjs.org/) / [Express.js](https://expressjs.com/) / HTML / CSS / [Tailwind](https://tailwindcss.com/docs/installation/using-vite)
- Backend: Node.js, Express
- Data Storage: PostgreSQL
- Hosting: (e.g., Vercel, Netlify, Local only for now)


## 📦 Project Setup (Local Development)

### 1. Clone the Repository (need a revisit/modify to the exact url)

```bash
git clone https://github.com/Botilazar/SZELLIT.git
cd szellit
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Start the Development Server
```bash
npm run dev
# or
yarn dev
```
Then open your browser to:
- http://localhost:3000 
- or whatever port is shown in the terminal output (e.g.: `:5173`, `:5432` depending on your Vite setup)

## 📁 Project Structure (High-Level)
```/szellit
    └── /client
          ├── node_modules 
          ├── public/images/
          ├── src/
          |   ├── assets/
          |   ├── Components/
          |   ├── hooks/
          |   ├── locales/
          |   ├── utils/
          |   App.tsx
          |   AuthContext.tsx
          |   i18n.ts
          |   main.tsx
          |   vite-env.d.ts
          ├── .env
          ├── .env.docker
          ├── Dockerfile
          ├── index.html
          ├── package-lock.json
          ├── package.json
          ├── tailwind.config.js
          ├── tsconfig.app.json
          ├── tsconfig.json
          ├── tsconfig.node.json
          ├── vite.config.ts
  
  └── /server
          ├── node_modules
          ├── src/
          |   ├── middleware/
          |   ├── routes/
          |   |   ├── auth/
          |   |       ├── login, register, logout, verifyEmail, verifyToken, ...
          |   |   ├── badges, honors, favourites, items, users, ...
          |   ├── servives/
          |   |   ├── emailing services
          |   ├── utils/
          |   |   ├── emailTemplates
          |   ├── app.ts
          |   ├── db.ts
          |   ├── index.ts
          ├── uploads/
          |   ├── profile-pics
          |       ├── .gitkeep
          ├── .env
          ├── .env.docker
          ├── Dockerfile
          ├── package-lock.json
          ├── package.json
          ├── tsconfig.json
  ├── .gitignore
  ├── docker-compose.yml
  ├── README.md
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

## ✅ To-Do / Roadmap
 - [x] Landing Page
 - [x] Sign In Page
 - [x] User Auth
 - [x] Item Listing Creation
 - [x] Search and Filters
 - [ ] Add sale item
 - [x] Register Page
 - [x] Password change
 - [x] Email verification
 - [x] Footer content: Terms, Privacy, Contact us


