import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import translationEN from "./EN.json";
import translationFR from "./FR.json";
import translationIT from "./IT.json";

export const resources = {
  FR: {
    translation: translationFR,
  },
  EN: {
    translation: translationEN,
  },
  IT: {
    translation: translationIT,
  },
};

export const languages = { FR: "Français", EN: "English", IT: "Italiano" };

i18n.use(initReactI18next).init({
  lng: "FR",
  resources,
});
