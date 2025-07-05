// src/App.tsx
import { Route, Routes, BrowserRouter, Navigate, Outlet, useParams } from "react-router-dom";
import { useEffect } from "react";
import i18n from "./i18n";

import Navbar from "./Components/Navbar/Navbar";
import Footer from "./Components/Footer/Footer";
import WelcomePage from "./Components/WelcomePage/WelcomePage";
import RegisterPage from "./Components/RegisterPage/RegisterPage";
import SignInPage from "./Components/SignInPage/SignInPage";
import BrowsingPage from "./Components/BrowsingPage/BrowsingPage";

function LocaleWrapper() {
  const { lng } = useParams<{ lng: string }>();

  useEffect(() => {
    if (lng && i18n.language !== lng) {
      i18n.changeLanguage(lng);
    }
  }, [lng]);

  return (
    <>
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/en" replace />} />
        <Route path="/:lng" element={<LocaleWrapper />}>
          <Route index element={<WelcomePage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="login" element={<SignInPage />} />
          <Route path="items" element={<BrowsingPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/en" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
