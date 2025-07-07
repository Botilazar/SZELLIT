import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import hu from "./locales/hu.json";
import en from "./locales/en.json";
import de from "./locales/de.json";

i18n
    .use(initReactI18next)
    .init({
        resources: {
            hu: { translation: hu },
            en: { translation: en },
            de: { translation: de },
        },
        fallbackLng: "en",
        lng: "en",
        interpolation: {
            escapeValue: false,
        },
        supportedLngs: ["en", "hu", "de"],
    });

export default i18n;
