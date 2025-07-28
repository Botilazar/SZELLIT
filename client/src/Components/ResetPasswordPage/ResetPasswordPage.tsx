// src/pages/ResetPasswordPage.tsx
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";

const ResetPasswordPage = () => {
  const { t } = useTranslation();
  const { lng } = useParams(); // get /:lng from route
  const [email, setEmail] = useState("");

  const [isCooldown, setIsCooldown] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(10); // 10s cooldown

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error(t("reset.error.emptyEmail"));
      return;
    }

    try {
      const response = await fetch("/api/auth/request-reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, lng }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(t("reset.success"));
        setIsCooldown(true);
        setSecondsLeft(10);
      } else {
        toast.error(data.error || t("reset.error.generic"));
      }
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error(t("reset.error.network"));
    }
  };

  useEffect(() => {
    if (isCooldown && secondsLeft > 0) {
      const interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(interval);
    } else if (secondsLeft === 0) {
      setIsCooldown(false);
    }
  }, [isCooldown, secondsLeft]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white px-4">
      <div className="max-w-md w-full bg-white text-gray-900 p-8 rounded-md shadow-md">
        <h1 className="text-2xl font-bold text-center mb-2">
          {t("reset.title")}
        </h1>
        <p className="text-center text-sm text-gray-600 mb-6">
          {t("reset.subtitle")}
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            disabled={isCooldown}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder={t("reset.emailPlaceholder")}
            className="w-full p-3 mb-4 border rounded bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isCooldown}
            className={`w-full py-2 font-semibold rounded transition ${
              isCooldown
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-500 text-white"
            }`}
          >
            {isCooldown
              ? `${t("reset.cooldownMessage")} (${secondsLeft}s)`
              : t("reset.button")}
          </button>
        </form>
        <div className="text-center mt-4">
          <Link
            to={`/${lng}/login`}
            className="text-blue-600 hover:underline text-sm"
          >
            {t("reset.backToLogin")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
