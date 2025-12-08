import { FaUserCircle, FaWallet } from "react-icons/fa";
import { MdDarkMode } from "react-icons/md";
import { LuSun } from "react-icons/lu";
import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import i18n from "../../i18n";
import { useTranslation } from "react-i18next";
import useDarkMode from "../../hooks/useDarkMode";
import { useAuth } from "../../AuthContext";
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
  const { user, logout, loading } = useAuth();
  const profileRef = useRef<HTMLDivElement>(null);

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

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) {
    return (
      <nav className="w-full h-[93px] szellit-navbar shadow-md flex items-center justify-between px-6">
        <div className="flex items-center h-full cursor-pointer">
          <Logo />
        </div>
        <div className="animate-pulse h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-full" />
      </nav>
    );
  }
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  return (
    <nav className="w-full h-[93px] szellit-navbar shadow-md flex items-center justify-between px-6">
      {/* Logo */}
      <div
        className="flex items-center h-full cursor-pointer"
        onClick={() => goTo("/items")}
      >
        <Logo />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Sell Button */}

        <button
          className="flex items-center gap-2 px-6 py-3 rounded-full 
               bg-gradient-to-r from-blue-500 to-blue-600 
               text-white font-semibold shadow-md 
               transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95"

        >
          <FaWallet className="text-lg" />
          <span>{t("navbar.sell")}</span>
        </button>

        {/* Language Flags */}
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-2 py-1 shadow-sm">
          {Object.entries(supportedLangs).map(([code, flag]) => (
            <button
              key={code}
              onClick={() => changeLanguage(code as SupportedLang)}
              className={`relative p-1 rounded-md transition-all duration-200 hover:scale-110
        ${lng === code ? "scale-105" : "grayscale opacity-70 hover:grayscale-0 hover:opacity-100"}`}
            >
              <img
                src={flag}
                alt={code}
                className="h-8 w-12 object-cover rounded-md"
              />
            </button>
          ))}
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className={`relative flex items-center justify-center w-[50px] h-[50px] rounded-full 
              transition-all duration-300 
              ${isDarkMode ? "bg-yellow-400/20" : "bg-gray-800/20"} 
              hover:scale-110 hover:shadow-lg`}
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? (
            <LuSun className="text-yellow-400 text-2xl transition-transform duration-300 transform" />
          ) : (
            <MdDarkMode className="text-gray-900 text-2xl transition-transform duration-300 transform" />
          )}
        </button>

        {/* Profile / Login */}
        <div className="relative" ref={profileRef}>
          {user ? (
            // Logged-in view: name + profile icon + dropdown
            <>
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium shadow-sm transition-all duration-300
            ${isDarkMode ? "bg-gray-800 text-white hover:bg-gray-700" : "bg-white text-gray-900 hover:bg-gray-100"}`}
                >
                  {/* Initials avatar */}
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center overflow-hidden text-white">
                    {user.prof_pic_url ? (
                      <img
                        src={`${API_URL}/${user.prof_pic_url}`}
                        alt={`${user.fname} ${user.lname}`}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <span className="font-medium">
                        {user?.fname?.[0]}
                        {user?.lname?.[0]}
                      </span>
                    )}
                  </div>
                  {/* Name */}
                  <span className="hidden sm:inline">
                    {user?.fname} {user?.lname}
                  </span>
                </button>

                {/* Dropdown menu */}
                {profileOpen && (
                  <div
                    className={`absolute right-0 mt-2 w-48 rounded-xl shadow-lg ring-1 overflow-hidden
              transition-all duration-200 animate-slide-down z-999
              ${isDarkMode ? "bg-gray-800 text-gray-200 ring-white/20" : "bg-white text-gray-900 ring-black/10"}`}
                  >
                    {[
                      {
                        label: t("navbar.profile"),
                        action: () => goTo(`/profiles/${user.user_id}`),
                      },
                      {
                        label: t("navbar.settings"),
                        action: () => goTo("/settings"),
                      },
                      {
                        label: t("navbar.favorites"),
                        action: () => goTo("/favorites"),
                      },
                      ...(user?.role === "ADMIN"
                        ? [
                          {
                            label: "Admin Panel",
                            action: () => goTo("/adminpanel"),
                          },
                        ]
                        : []),
                    ].map(({ label, action }) => (
                      <button
                        key={label}
                        onClick={action}
                        className={`w-full text-left px-4 py-2 transition-colors duration-200
                  ${isDarkMode ? "hover:bg-gray-700 text-gray-200" : "hover:bg-gray-100 text-gray-900"}`}
                      >
                        {label}
                      </button>
                    ))}
                    <button
                      onClick={async () => {
                        try {
                          await logout();
                          navigate(`/${lng}/welcome`);
                        } catch (err) {
                          console.error("Logout error:", err);
                        } finally {
                          setProfileOpen(false);
                        }
                      }}
                      className={`w-full text-left px-4 py-2 transition-colors duration-200 text-red-600
                ${isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
                    >
                      {t("navbar.logout")}
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            // Not logged in: styled same as logged-in button
            <button
              onClick={() => goTo("/login")}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium shadow-sm transition-all duration-300
        ${isDarkMode ? "bg-gray-800 text-white hover:bg-gray-700" : "bg-white text-gray-900 hover:bg-gray-100"}`}
            >
              <FaUserCircle className="text-lg" />
              {t("navbar.login")}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
