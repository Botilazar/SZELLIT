import {
  Route,
  Routes,
  BrowserRouter,
  Navigate,
  Outlet,
  useParams,
} from "react-router-dom";
import { useEffect } from "react";
import i18n from "./i18n";

import Navbar from "./Components/Navbar/Navbar";
import Footer from "./Components/Footer/Footer";
import WelcomePage from "./Components/WelcomePage/WelcomePage";
import RegisterPage from "./Components/RegisterPage/RegisterPage";
import SignInPage from "./Components/SignInPage/SignInPage";
import BrowsingPage from "./Components/BrowsingPage/BrowsingPage";
import { AuthProvider } from "./AuthContext";
import ResetPasswordPage from "./Components/ResetPasswordPage/ResetPasswordPage";
import EmailVerifyPage from "./Components/EmailVerifyPage/EmailVerify";
import ConfirmResetPasswordPage from "./Components/confirmResetPasswordPage/confirmResetPasswordPage";
import FavoritesPage from "./Components/FavoritesPage/FavoritesPage";
import DetailedItemPage from "./Components/DetailedItemPage/DetailedItemPage";
import AdminPanelPage from "./Components/AdminPanelPage/AdminPanelPage";
import ProfilePage from "./Components/ProfilePage/ProfilePage";
import SettingsPage from "./Components/SettingsPage/SettingsPage";
import BadgesShowcasePage from "./Components/BadgeShowcasePage/BadgeShowcasePage";

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
      <main className="szellit-background flex-grow">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/en" replace />} />
          <Route path="/:lng" element={<LocaleWrapper />}>
            <Route index element={<WelcomePage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="login" element={<SignInPage />} />
            <Route path="items" element={<BrowsingPage />} />
            <Route path="items/:itemId" element={<DetailedItemPage />} />
            <Route path="profiles/:userId" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="favorites" element={<FavoritesPage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />
            <Route path="adminpanel" element={<AdminPanelPage />} />
            <Route path="badges" element={<BadgesShowcasePage />} />
            <Route
              path="reset-password-confirm"
              element={<ConfirmResetPasswordPage />}
            />
            <Route path="verify-email" element={<EmailVerifyPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/en" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
