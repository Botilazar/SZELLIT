// src/pages/ResetPasswordPage.tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

const ResetPasswordPage = () => {
  const { t } = useTranslation();
  const { lng } = useParams(); // get /:lng from route
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(t("reset.success")); // replace with actual API call
  };

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
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder={t("reset.emailPlaceholder")}
            className="w-full p-3 mb-4 border rounded bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 font-semibold rounded hover:bg-blue-500 transition"
          >
            {t("reset.button")}
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
