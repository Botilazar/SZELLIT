import "./RegisterPage.css";
import { Link, useParams /*useSearchParams*/ } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState /*useEffect*/ } from "react";
//import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import VerifyEmailModal from "../verifyEmailModal/verifyEmailModal";

const RegisterPage = () => {
  const { t } = useTranslation();
  const { lng } = useParams(); // For dynamic route links
  //const navigate = useNavigate();
  //const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [showModal, setShowModal] = useState(false); // add this

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    neptun: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setAcceptTerms(checked);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.neptun ||
      !formData.password
    ) {
      toast.error(t("register.requiredFields"));
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error(t("register.invalidEmail"));
      return;
    }
    const neptunRegex = /^[A-Za-z0-9]+$/;
    if (!neptunRegex.test(formData.neptun) || formData.neptun.length !== 6) {
      toast.error(t("register.invalidNeptun"));
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error(t("register.passwordMismatch"));
      return;
    }
    if (!acceptTerms) {
      toast.error(t("register.acceptTermsAlert"));
      return;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    if (!passwordRegex.test(formData.password)) {
      toast.error(t("register.passwordInvalid"));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          neptun: formData.neptun.toUpperCase(),
          password: formData.password,
          lng: lng, // Pass the language for email templates
        }),
      });
      //debug:
      const text = await response.text();
      console.log("Response text:", text);
      const result = text ? JSON.parse(text) : {};

      if (response.ok) {
        setUserEmail(formData.email);
        setEmailSent(true);
        setShowModal(true);
        toast.success(t("register.success"));
      } else {
        toast.error(result.error || t("register.genericError"));
      }
    } catch (err) {
      toast.error(t("register.networkError"));
      console.error("Register error:", err);
    } finally {
      setLoading(false);
    }
  };
  const handleResendVerification = async () => {
    if (!userEmail) {
      toast.error(t("register.checkEmail.noEmail"));
      return;
    }
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, lng }),
      });
      if (res.ok) {
        toast.success(t("register.checkEmail.resendSuccess"));
      } else {
        toast.error(t("register.checkEmail.resendError"));
      }
    } catch (err) {
      console.error("Resend error:", err);
      toast.error(t("register.checkEmail.resendError"));
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
            disabled={loading}
          />
          <input
            type="email"
            name="email"
            placeholder={t("register.email")}
            className="w-full px-4 py-2  szellit-forminput"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
          />
          <input
            type="text"
            name="neptun"
            placeholder={t("register.neptun")}
            className="w-full px-4 py-2 szellit-forminput uppercase"
            value={formData.neptun}
            onChange={(e) => {
              setFormData({
                ...formData,
                neptun: e.target.value.toUpperCase(),
              });
            }}
            disabled={loading}
          />
          <input
            type="password"
            name="password"
            placeholder={t("register.password")}
            className="w-full px-4 py-2 szellit-forminput"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder={t("register.confirmPassword")}
            className="w-full px-4 py-2 szellit-forminput"
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={loading}
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
              disabled={loading}
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
            disabled={loading}
            className={`w-full py-2 rounded transition-colors flex items-center justify-center gap-2 ${
              loading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-500 text-white "
            }`}
          >
            {loading && (
              <svg
                className="animate-spin h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  strokeWidth="4"
                  d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            <span>
              {loading ? t("register.loading") : t("register.createAccount")}
            </span>
          </button>
        </form>
        <VerifyEmailModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          email={userEmail}
          onResend={handleResendVerification}
        />
      </div>
    </div>
  );
};

export default RegisterPage;
