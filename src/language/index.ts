import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import webEN from "./EN/website.json";
import webFR from "./FR/website.json";
import webIT from "./IT/website.json";
import commonEN from "./EN/common.json";
import commonFR from "./FR/common.json";
import commonIT from "./IT/common.json";
import lesionEN from "./EN/lesionGame.json";
import lesionFR from "./FR/lesionGame.json";
import lesionIT from "./IT/lesionGame.json";
import explanationEN from "./EN/explanation.json";
import explanationFR from "./FR/explanation.json";
import explanationIT from "./IT/explanation.json";
import achievementEN from "./EN/achievements.json";
import achievementFR from "./FR/achievements.json";
import achievementIT from "./IT/achievements.json";

export const resources = {
  FR: {
    translation: webFR,
    common: commonFR,
    lesionGame: lesionFR,
    explanation: explanationFR,
    achievements: achievementFR,
  },
  EN: {
    translation: webEN,
    common: commonEN,
    lesionGame: lesionEN,
    explanation: explanationEN,
    achievements: achievementEN,
  },
  IT: {
    translation: webIT,
    common: commonIT,
    lesionGame: lesionIT,
    explanation: explanationIT,
    achievements: achievementIT,
  },
};

export const languages = { FR: "Français", EN: "English", IT: "Italiano" };

i18n.use(initReactI18next).init({
  lng: "FR",
  resources,
});
