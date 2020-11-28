import VueI18n from "vue-i18n";
import Vue from "vue";
import enUS from "./en-US";
import frFR from "./fr-FR";

Vue.use(VueI18n);

const messages = {
  "en-US": enUS,
  "fr-FR": frFR,
};

// Create VueI18n instance with options
export default new VueI18n({
  //locale: navigator.language || navigator.userLanguage,
  locale: "en-US",
  fallbackLocale: "en-US",
  messages, // set locale messages
});
