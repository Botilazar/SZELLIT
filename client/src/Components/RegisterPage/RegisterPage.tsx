import "./RegisterPage.css";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState } from "react";

const RegisterPage = () => {
  const { t } = useTranslation();
  const { lng } = useParams(); // For dynamic route links

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setAcceptTerms(checked);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert(t("register.passwordMismatch"));
      return;
    }
    if (!acceptTerms) {
      alert(t("register.acceptTermsAlert"));
      return;
    }
    console.log("Registration Data:", formData);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold">{t("register.title")}</h1>
        <p className="text-gray-400">
          {t("register.haveAccount")}{" "}
          <Link to={`/${lng}/login`}>
            <span className="text-blue-400 hover:text-blue-300 transition-colors">
              {t("register.signIn")}
            </span>
          </Link>
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="fullName"
            placeholder={t("register.fullName")}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md"
            value={formData.fullName}
            onChange={handleChange}
          />
          <input
            type="email"
            name="email"
            placeholder={t("register.email")}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md"
            value={formData.email}
            onChange={handleChange}
          />
          <input
            type="text"
            name="username"
            placeholder={t("register.username")}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md"
            value={formData.username}
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder={t("register.password")}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md"
            value={formData.password}
            onChange={handleChange}
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder={t("register.confirmPassword")}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md"
            value={formData.confirmPassword}
            onChange={handleChange}
          />

          <div>
            <h3 className="text-sm text-gray-400 mb-2">
              {t("register.passwordRequirementsTitle")}
            </h3>
            <ul className="text-xs space-y-1 text-gray-400 pl-4 list-disc">
              <li>{t("register.passwordRequirement.length")}</li>
              <li>{t("register.passwordRequirement.uppercase")}</li>
              <li>{t("register.passwordRequirement.lowercase")}</li>
              <li>{t("register.passwordRequirement.number")}</li>
              <li>{t("register.passwordRequirement.special")}</li>
            </ul>
          </div>

          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={handleChange}
              className="form-checkbox h-4 w-4 text-blue-600"
            />
            <span>
              {t("register.accept")}{" "}
              <a href="#" className="text-blue-400 hover:underline">
                {t("register.terms")}
              </a>{" "}
              {t("register.and")}{" "}
              <a href="#" className="text-blue-400 hover:underline">
                {t("register.privacy")}
              </a>
            </span>
          </label>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-500 transition-colors"
          >
            {t("register.createAccount")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
