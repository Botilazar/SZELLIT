import { useState } from "react";
import { Link } from "react-router-dom";
import "./RegisterPage.css"; // Importing the CSS file for styles

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(true);

  // Password validation state
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate password requirements in real-time
    if (name === "password") {
      validatePassword(value);
    }
    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setIsEmailValid(emailRegex.test(value));
    }
  };

  const validatePassword = (password) => {
    setPasswordRequirements({
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  };

  const isFormValid =
    formData.fullName.trim() !== "" &&
    formData.username.trim() !== "" &&
    isEmailValid &&
    formData.password === formData.confirmPassword &&
    Object.values(passwordRequirements).every(Boolean) &&
    acceptTerms;

  const handleSubmit = () => {
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    if (!acceptTerms) {
      alert("Please accept the Terms and Conditions");
      return;
    }
    console.log("Registration data:", formData);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Create your account</h1>
          <p className="text-gray-400">
            Already have an account?{" "}
            <Link to="/login">
              <span className="text-blue-400 hover:text-blue-300 transition-colors">
                Sign in
              </span>
            </Link>
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Full Name */}
          <div>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Full name"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
              required
            />
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email address"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
              required
            />
          </div>

          {/* Username */}
          <div>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Username"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
              required
            />
          </div>

          {/* Password */}
          <div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Password"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
              required
            />
          </div>

          {/* Confirm Password */}
          <div>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm password"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
              required
            />
          </div>

          {/* Password Requirements */}
          <div className="bg-slate-800 rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-medium text-gray-300">
              Password requirements:
            </h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    passwordRequirements.minLength
                      ? "bg-green-500"
                      : "bg-transparent border border-red-500"
                  }`}
                >
                  {passwordRequirements.minLength ? (
                    <svg
                      className="w-2.5 h-2.5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-2.5 h-2.5 text-red-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <span
                  className={`text-sm ${
                    passwordRequirements.minLength
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  At least 8 characters
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    passwordRequirements.hasUppercase
                      ? "bg-green-500"
                      : "bg-transparent border border-red-500"
                  }`}
                >
                  {passwordRequirements.hasUppercase ? (
                    <svg
                      className="w-2.5 h-2.5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-2.5 h-2.5 text-red-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <span
                  className={`text-sm ${
                    passwordRequirements.hasUppercase
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  At least one uppercase letter
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    passwordRequirements.hasLowercase
                      ? "bg-green-500"
                      : "bg-transparent border border-red-500"
                  }`}
                >
                  {passwordRequirements.hasLowercase ? (
                    <svg
                      className="w-2.5 h-2.5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-2.5 h-2.5 text-red-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <span
                  className={`text-sm ${
                    passwordRequirements.hasLowercase
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  At least one lowercase letter
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    passwordRequirements.hasNumber
                      ? "bg-green-500"
                      : "bg-transparent border border-red-500"
                  }`}
                >
                  {passwordRequirements.hasNumber ? (
                    <svg
                      className="w-2.5 h-2.5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-2.5 h-2.5 text-red-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <span
                  className={`text-sm ${
                    passwordRequirements.hasNumber
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  At least one number
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    passwordRequirements.hasSpecialChar
                      ? "bg-green-500"
                      : "bg-transparent border border-red-500"
                  }`}
                >
                  {passwordRequirements.hasSpecialChar ? (
                    <svg
                      className="w-2.5 h-2.5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-2.5 h-2.5 text-red-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <span
                  className={`text-sm ${
                    passwordRequirements.hasSpecialChar
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  At least one special character
                </span>
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="acceptTerms"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 bg-slate-800 border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
            />
            <label htmlFor="acceptTerms" className="text-sm text-gray-300">
              I accept the{" "}
              <a
                href="#"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Terms and Conditions
              </a>{" "}
              and{" "}
              <a
                href="#"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Privacy Policy
              </a>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isFormValid}
            className={`w-full py-3 px-4 font-medium rounded-lg transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 ${
              isFormValid
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-600 text-gray-300 cursor-not-allowed"
            }`}
          >
            Create account
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
