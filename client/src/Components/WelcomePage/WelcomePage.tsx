// Components/WelcomePage/WelcomePage.tsx
import { useTranslation } from "react-i18next";
import LocalizedLink from "../LocalizedLink/LocalizedLink"; // import your helper
import { Heart, MessageSquare, ShoppingCart } from "lucide-react";

const WelcomePage = () => {
  const { t } = useTranslation();

  return (
    <div className="szellit-background min-h-screen flex flex-col">
      <main className="flex-grow flex flex-col items-center justify-center text-center px-4 py-8 space-y-6">
        <h1 className="text-3xl md:text-5xl font-bold">{t("welcome.title")}</h1>
        <p className="text-zinc-400 max-w-md">{t("welcome.description")}</p>

        <div className="flex flex-col md:flex-row gap-4 mt-6">
          <LocalizedLink to="/register">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition">
              {t("welcome.buttons.getStarted")}
            </button>
          </LocalizedLink>
          <LocalizedLink to="/login">
            <button className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-600 px-6 py-3 rounded-lg transition">
              {t("welcome.buttons.signIn")}
            </button>
          </LocalizedLink>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 w-full max-w-4xl">
          <div className="flex flex-col items-center space-y-2">
            <MessageSquare className="w-8 h-8 text-blue-400" />
            <p className="text-sm">{t("welcome.features.message")}</p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Heart className="w-8 h-8 text-pink-400" />
            <p className="text-sm">{t("welcome.features.favorite")}</p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <ShoppingCart className="w-8 h-8 text-green-400" />
            <p className="text-sm">{t("welcome.features.post")}</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WelcomePage;
