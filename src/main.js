import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import VueTextareaAutosize from "vue-textarea-autosize";
import "bulma/css/bulma.css";
import PortalVue from "portal-vue";
import vClickOutside from "v-click-outside";
import "animate.css/animate.min.css";
import "vue-loading-overlay/dist/vue-loading.css";
import VueLazyload from "vue-lazyload";
import VueI18n from "vue-i18n";
import translations from "./i18n";

Vue.use(VueI18n);
Vue.use(VueLazyload);
Vue.use(vClickOutside);
Vue.use(PortalVue);
Vue.use(VueTextareaAutosize);
Vue.use(require("vue-moment"));

Vue.config.productionTip = false;

// Create VueI18n instance with options
const i18n = new VueI18n({
  locale: navigator.language || navigator.userLanguage, // set locale,
  // locale: 'en',
  fallbackLocale: "en",
  messages: translations // set locale messages
});

new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount("#app");
