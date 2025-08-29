import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import "./i18n";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./AuthContext.tsx";

// ⚡ Apply dark mode class immediately
const isDarkMode = localStorage.getItem("theme") === "dark";
if (isDarkMode) {
  document.documentElement.classList.add("dark");
} else {
  document.documentElement.classList.remove("dark");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
    <Toaster position="bottom-right" reverseOrder={false} />
  </StrictMode>
);
