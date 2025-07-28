import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";

const ConfirmResetPasswordPage = () => {
  const { t } = useTranslation();
  const { lng } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (!token) {
      toast.error(t("reset.error.invalidToken"));
      navigate(`/${lng}/login`);
    }
  }, [token, navigate, lng, t]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error(t("reset.error.passwordsDontMatch"));
      return;
    }

    if (newPassword.length < 8) {
      toast.error(t("reset.error.tooShort"));
      return;
    }

    try {
      const response = await fetch("/api/auth/confirm-reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(t("reset.successConfirmed"));
        navigate(`/${lng}/login`);
      } else {
        toast.error(data.error || t("reset.error.generic"));
      }
    } catch (err) {
      console.error("Reset confirm error:", err);
      toast.error(t("reset.error.network"));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white px-4">
      <div className="max-w-md w-full bg-white text-gray-900 p-8 rounded-md shadow-md">
        <h1 className="text-2xl font-bold text-center mb-2">
          {t("reset.setNewPassword")}
        </h1>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            placeholder={t("reset.newPasswordPlaceholder")}
            className="w-full p-3 mb-4 border rounded bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder={t("reset.confirmPasswordPlaceholder")}
            className="w-full p-3 mb-4 border rounded bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 font-semibold rounded hover:bg-blue-500 transition"
          >
            {t("reset.saveNewPassword")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ConfirmResetPasswordPage;
