import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import "./i18n";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./AuthContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
    <Toaster position="bottom-right" reverseOrder={false} />
  </StrictMode>
);
