import VueI18n from "vue-i18n";
import Vue from "vue";
import en from "./en";
import frFR from "./fr-FR";

Vue.use(VueI18n);

const messages = {
  en: en,
  "fr-FR": frFR
};

// Create VueI18n instance with options
export default new VueI18n({
  locale: navigator.language || navigator.userLanguage,
  locale: "en",
  fallbackLocale: "en",
  messages // set locale messages
});
