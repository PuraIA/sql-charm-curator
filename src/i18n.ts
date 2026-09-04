import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";

i18n
    .use(HttpBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        load: "languageOnly",
        supportedLngs: ["en", "pt", "de", "fr", "zh", "ja", "es"],
        nonExplicitSupportedLngs: true,
        fallbackLng: "en",
        ns: ["translation"],
        defaultNS: "translation",
        backend: {
            loadPath: "/locales/{{lng}}/{{ns}}.json",
        },
        detection: {
            order: ["localStorage", "navigator", "htmlTag", "path", "subdomain"],
            caches: ["localStorage"]
        },
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
