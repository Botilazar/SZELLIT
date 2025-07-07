import "./SignInPage.css";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

const SignInPage = () => {
  const { t } = useTranslation();
  const { lng } = useParams(); // for dynamic links

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-center text-2xl font-bold">
          {t("signin.title")}
        </h2>
        <p className="text-center text-gray-400">
          {t("signin.or")}{" "}
          <Link to={`/${lng}/register`}>
            <span className="text-blue-400 hover:underline">
              {t("signin.createAccount")}
            </span>
          </Link>
        </p>

        <form className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
              {t("signin.email")}
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-3 py-2 mt-1 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="example@gmail.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              {t("signin.password")}
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-3 py-2 mt-1 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="****"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center text-sm text-gray-300">
              <input
                type="checkbox"
                className="mr-2 bg-gray-700 border-gray-600 rounded"
              />
              {t("signin.remember")}
            </label>
            <a href="#" className="text-sm text-blue-400 hover:underline">
              {t("signin.forgot")}
            </a>
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
