import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { useAuth } from "../../AuthContext";

type userData = {
  id: number;
  fullName: string;
  email: string;
  createdAt: string;
};

const EmailVerifyPage = () => {
  const { t } = useTranslation();
  const { lng } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();

  const [verificationState, setVerificationState] = useState<
    "loading" | "success" | "error" | "alreadyVerified"
  >("loading");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [userData, setUserData] = useState<userData | null>(null);

  const toastShownRef = useRef(false);
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setVerificationState("error");
      toast.error(t("verifyEmail.missingToken"));
      return;
    }

    const verifyEmail = async (token: string) => {
      try {
        const res = await fetch(`${API_URL}/api/auth/verify-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ token }),
        });

        const result = await res.json();

        if (res.ok) {
          setVerificationState("success");
          setUserData(result.user);

          login(result.user);

          // Show success modal
          setShowSuccessModal(true);

          // Auto-redirect to items after 3 seconds
          setTimeout(() => {
            navigate(`/${lng}/items`, { replace: true });
          }, 3000);
        } else {
          if (result.alreadyVerified) {
            setVerificationState("alreadyVerified");
            if (!toastShownRef.current) {
              toast.success(t("verifyEmail.alreadyVerified"));
              toastShownRef.current = true;
            }
          } else {
            setVerificationState("error");
            toast.error(result.message || t("verifyEmail.error"));
          }
        }
      } catch (err) {
        console.error("Verification error:", err);
        setVerificationState("error");
        toast.error(t("verifyEmail.networkError"));
      }
    };

    verifyEmail(token);
  }, [searchParams, navigate, t, lng, login, API_URL]);

  const handleContinue = () => {
    navigate(`/${lng}/items`, { replace: true });
  };

  if (verificationState === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
        <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto">
              <svg
                className="animate-spin w-16 h-16 text-blue-600"
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
                  d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
            <h1 className="text-2xl font-bold">{t("verifyEmail.verifying")}</h1>
            <p className="text-gray-400">{t("verifyEmail.pleaseWait")}</p>
          </div>
        </div>
      </div>
    );
  }

  if (verificationState === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
        <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-red-600 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-red-400">
              {t("verifyEmail.failed")}
            </h1>
            <p className="text-gray-400">{t("verifyEmail.failedMessage")}</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate(`/${lng}/login`)}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md transition-colors"
            >
              {t("verifyEmail.goToLogin")}
            </button>
            <button
              onClick={() => navigate(`/${lng}/register`)}
              className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
            >
              {t("verifyEmail.tryAgain")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success Modal Overlay
  if (showSuccessModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
        <div className="w-full max-w-md mx-4">
          <div className="bg-gray-800 rounded-lg shadow-2xl p-8 text-center space-y-6">
            <div className="space-y-4">
              <div className="w-20 h-20 mx-auto bg-green-600 rounded-full flex items-center justify-center animate-pulse">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">
                {t("verifyEmail.success")}
              </h2>
              <p className="text-gray-300">
                {t("verifyEmail.welcomeMessage")}{" "}
                <strong className="text-green-400">{userData?.fullName}</strong>
                !
              </p>
              <p className="text-sm text-gray-400">
                {t("verifyEmail.redirectingMessage")}
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleContinue}
                className="w-full px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-md font-semibold transition-colors"
              >
                {t("verifyEmail.continueToApp")}
              </button>
              <div className="w-full bg-gray-700 rounded-full h-1">
                <div
                  className="bg-green-600 h-1 rounded-full animate-[progress_3s_ease-in-out_forwards]"
                  style={{
                    animation: "progress 3s ease-in-out forwards",
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes progress {
            from { width: 0%; }
            to { width: 100%; }
          }
        `}</style>
      </div>
    );
  }

  if (verificationState === "alreadyVerified") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
        <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-yellow-600 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M12 18a6 6 0 100-12 6 6 0 000 12z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-yellow-400">
              {t("verifyEmail.alreadyVerified")}
            </h1>
            <p className="text-gray-400">
              {t("verifyEmail.alreadyVerifiedMessage")}
            </p>
          </div>
          <button
            onClick={() => navigate(`/${lng}/items`)}
            className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-md transition-colors"
          >
            {t("verifyEmail.continueToApp")}
          </button>
        </div>
      </div>
    );
  }

  // Fallback success state without modal
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg text-center">
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto bg-green-600 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-green-400">
            {t("verifyEmail.success")}
          </h1>
          <p className="text-gray-400">{t("verifyEmail.successMessage")}</p>
        </div>

        <button
          onClick={handleContinue}
          className="w-full px-4 py-2 bg-green-600 hover:bg-green-500 rounded-md transition-colors"
        >
          {t("verifyEmail.continueToApp")}
        </button>
      </div>
    </div>
  );
};

export default EmailVerifyPage;
