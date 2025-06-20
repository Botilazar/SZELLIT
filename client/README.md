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

### 1. Clone the Repository (need a revisit/modify to the exact url)

```bash
git clone https://github.com/your-username/szellit-marketplace.git
cd szellit-marketplace
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
 - [ ] User Auth
 - [ ] Item Listing Creation
 - [ ] Search and Filters


 # _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_ - also resz delete?

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
