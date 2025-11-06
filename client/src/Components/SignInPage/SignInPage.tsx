import "./SignInPage.css";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useAuth } from "../../AuthContext";
import { toast } from "react-hot-toast";

const SignInPage = () => {
  const { t } = useTranslation();
  const { lng } = useParams(); // for dynamic links
  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const from = (location.state as { from?: string })?.from || `/${lng}/items`;
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(from);
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const { user } = await response.json();
        login(user);
        toast.success(t("signin.success"));
        navigate(`/${lng}/items`); // or wherever you want
      } else {
        const result = await response.json();
        toast.error(result.error || t("signin.genericError"));
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error(t("signin.networkError"));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center szellit-background">
      <div className="w-full max-w-md p-8 space-y-6 szellit-form rounded-lg shadow-lg">
        <h2 className="text-center text-2xl font-bold">{t("signin.title")}</h2>
        <p className="text-center szellit-text">
          {t("signin.or")}{" "}
          <Link to={`/${lng}/register`}>
            <span className="text-blue-400 hover:underline">
              {t("signin.createAccount")}
            </span>
          </Link>
        </p>

        <form className="szellit-form space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium szellit-text"
            >
              {t("signin.email")}
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 mt-1 szellit-forminput rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="example@gmail.com"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium szellit-text"
            >
              {t("signin.password")}
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 szellit-forminput rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="****"
              required
              autoComplete="current-password"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center text-sm szellit-text">
              <input
                type="checkbox"
                className="mr-2 bg-gray-700 border-gray-600 rounded"
              />
              {t("signin.remember")}
            </label>
            <Link
              to={`/${lng}/reset-password`}
              className="text-sm text-blue-400 hover:underline"
            >
              {t("signin.forgot")}
            </Link>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-500 focus:ring-2 focus:ring-blue-400"
          >
            {t("signin.button")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignInPage;
