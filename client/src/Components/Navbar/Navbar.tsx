import Logo from "../Logo/Logo";
import { FaUserCircle, FaWallet } from "react-icons/fa";
import { MdDarkMode } from "react-icons/md";
import { useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import i18n from "../../i18n";
import { useTranslation } from "react-i18next";

import huFlag from "../../assets/hungary.png";
import gbFlag from "../../assets/united-kingdom.png";
import deFlag from "../../assets/germany.png";

type SupportedLang = "hu" | "en" | "de";

const Navbar = () => {
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { lng } = useParams<{ lng: SupportedLang }>();
  const { t } = useTranslation();

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
    navigate(newPath);
  };

  return (
    <nav className="w-full h-[93px] bg-white shadow-md flex items-center justify-between px-6">
      {/* Left: Logo */}
      <div className="flex items-center h-full">
        <Logo />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 border-2 border-[#313944] rounded-[15px] px-6 py-3 text-[#313944] font-extrabold uppercase hover:bg-gray-100 transition">
          <FaWallet className="text-xl" />
          <span>{t("navbar.sell")}</span>
        </button>

        {/* Language Flags */}
        <div className="flex items-center gap-1 border-2 border-[#313944] rounded-[15px] px-1 py-1 bg-[#f3f3f3]">
          {Object.entries(supportedLangs).map(([code, flag]) => (
            <button
              key={code}
              onClick={() => changeLanguage(code as SupportedLang)}
              className={`p-1 rounded-md transition hover:bg-gray-300 ${lng === code ? "bg-gray-300" : ""}`}
            >
              <img src={flag} alt={code} className="h-[30px] w-[40px] object-cover" />
            </button>
          ))}
        </div>

        <button className="flex items-center justify-center border-2 border-[#313944] rounded-full w-[57px] h-[57px] text-[#313944] hover:bg-gray-100 transition">
          <MdDarkMode className="text-2xl" />
        </button>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="text-[#313944] text-[2.7rem] focus:outline-none"
          >
            <FaUserCircle />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <a href="#" className="block px-4 py-2 hover:bg-gray-100">{t("navbar.profile")}</a>
              <a href="#" className="block px-4 py-2 hover:bg-gray-100">{t("navbar.settings")}</a>
              <a href="#" className="block px-4 py-2 text-red-600 hover:bg-gray-100">{t("navbar.logout")}</a>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
