import { FaUserCircle, FaWallet } from "react-icons/fa";
import { MdDarkMode } from "react-icons/md";
import { LuSun } from "react-icons/lu";
import { useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import i18n from "../../i18n";
import { useTranslation } from "react-i18next";
import useDarkMode from "../../hooks/useDarkMode";
import huFlag from "../../assets/hungary.png";
import gbFlag from "../../assets/united-kingdom.png";
import deFlag from "../../assets/germany.png";
import Logo from "../Logo/Logo";

type SupportedLang = "hu" | "en" | "de";

const Navbar = () => {
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { lng } = useParams<{ lng: SupportedLang }>();
  const { t } = useTranslation();

  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const supportedLangs: Record<SupportedLang, string> = {
    hu: huFlag,
    en: gbFlag,
    de: deFlag,
  };

  const changeLanguage = (lang: SupportedLang) => {
    if (lang === lng) return;
    const pathSegments = location.pathname.split("/");
    pathSegments[1] = lang;
    const newPath = pathSegments.join("/") || `/${lang}`;
    i18n.changeLanguage(lang);
    navigate(newPath, { replace: true });
  };

  const goTo = (path: string) => {
    if (!lng) return;
    navigate(`/${lng}${path}`);
    setProfileOpen(false);
  };

  return (
    <nav className="w-full h-[93px] szellit-navbar shadow-md flex items-center justify-between px-6">
      {/* Logo */}
      <div className="flex items-center h-full">
        <Logo />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button className="szellit-button flex items-center gap-2 border-2 rounded-[15px] px-6 py-3 text-[#313944] font-extrabold uppercase ">
          <FaWallet className="szellit-background text-xl" />
          <span className="szellit-text">{t("navbar.sell")}</span>
        </button>

        {/* Language Flags */}
        <div className="szellit-background flex items-center gap-1 border-2 rounded-[15px] px-1 py-1 ">
          {Object.entries(supportedLangs).map(([code, flag]) => (
            <button
              key={code}
              onClick={() => changeLanguage(code as SupportedLang)}
              className={`szellit-button p-1 rounded-md  ${lng === code
                ? "szellit-button "
                : ""
                }`}
            >
              <img
                src={flag}
                alt={code}
                className="h-[30px] w-[40px] object-cover"
              />
            </button>
          ))}
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className=" szellit-button flex items-center justify-center border-2 rounded-full w-[57px] h-[57px] "
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? <LuSun className="szellit-button text-2xl" /> : <MdDarkMode className="szellit-button text-2xl" />}
        </button>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="szellit-buton text-[2.7rem] focus:outline-none"
          >
            <FaUserCircle />
          </button>

          {profileOpen && (
            <div className="szellit-background absolute right-0 mt-2 w-48  rounded-lg shadow-lg z-50">
              <button onClick={() => goTo("/profile")} className="w-full text-left px-4 py-2 szellit-button">
                {t("navbar.profile")}
              </button>
              <button onClick={() => goTo("/settings")} className="w-full text-left px-4 py-2 szellit-button">
                {t("navbar.settings")}
              </button>
              <button onClick={() => goTo("/favorites")} className="w-full text-left px-4 py-2 szellit-button">
                {t("navbar.favorites")}
              </button>
              <button onClick={() => setProfileOpen(false)} className="w-full text-left px-4 py-2 text-red-600 szellit-button">
                {t("navbar.logout")}
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
