import "./RegisterPage.css";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const { t } = useTranslation();
  const { lng } = useParams(); // For dynamic route links
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setAcceptTerms(checked);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.username ||
      !formData.password
    ) {
      alert(t("register.requiredFields"));
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert(t("register.invalidEmail"));
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      alert(t("register.passwordMismatch"));
      return;
    }
    if (!acceptTerms) {
      alert(t("register.acceptTermsAlert"));
      return;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    if (!passwordRegex.test(formData.password)) {
      alert(t("register.passwordInvalid"));
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          username: formData.username,
          password: formData.password,
        }),
      });
      //debug:
      const text = await response.text();
      console.log("Response text:", text);
      const result = text ? JSON.parse(text) : {};

      if (response.ok) {
        alert(t("register.success"));
        navigate(`/${lng}/login`);
      } else {
        alert(result.error || t("register.genericError"));
      }
    } catch (err) {
      alert(t("register.networkError"));
      console.error("Register error:", err);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center szellit-background">
      <div className="w-full max-w-md p-8 space-y-6 szellit-form rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold">{t("register.title")}</h1>
        <p className="text-gray-400">
          {t("register.haveAccount")}{" "}
          <Link to={`/${lng}/login`}>
            <span className="text-blue-400 hover:text-blue-300 transition-colors">
              {t("register.signIn")}
            </span>
          </Link>
        </p>

        <form className="szellit-form space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="fullName"
            placeholder={t("register.fullName")}
            className="w-full px-4 py-2 szellit-forminput"
            value={formData.fullName}
            onChange={handleChange}
          />
          <input
            type="email"
            name="email"
            placeholder={t("register.email")}
            className="w-full px-4 py-2  szellit-forminput"
            value={formData.email}
            onChange={handleChange}
          />
          <input
            type="text"
            name="username"
            placeholder={t("register.username")}
            className="w-full px-4 py-2 szellit-forminput"
            value={formData.username}
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder={t("register.password")}
            className="w-full px-4 py-2 szellit-forminput"
            value={formData.password}
            onChange={handleChange}
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder={t("register.confirmPassword")}
            className="w-full px-4 py-2 szellit-forminput"
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
              <Link
                to={`/${lng}/terms`}
                className="text-blue-400 hover:underline"
              >
                {t("register.terms")}
              </Link>{" "}
              {t("register.and")}{" "}
              <Link
                to={`/${lng}/privacy`}
                className="text-blue-400 hover:underline"
              >
                {t("register.privacy")}
              </Link>
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
