import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import VueTextareaAutosize from "vue-textarea-autosize";
import PortalVue from "portal-vue";
import vClickOutside from "v-click-outside";
import VueLazyload from "vue-lazyload";
import i18n from "./i18n/index";
import Toasted from "vue-toasted";
import * as Sentry from "@sentry/browser";
import { Vue as VueIntegration } from "@sentry/integrations";
import vueDebounce from "vue-debounce";
import "./scss/main.scss";

if (process.env.VUE_APP_SENTRY_URL && process.env.NODE_ENV !== "development") {
  Sentry.init({
    dsn: process.env.VUE_APP_SENTRY_URL,
    integrations: [new VueIntegration({ Vue, attachProps: true })],
  });
}

Vue.use(VueLazyload);
Vue.use(vClickOutside);
Vue.use(PortalVue);
Vue.use(VueTextareaAutosize);
Vue.use(Toasted);
Vue.use(vueDebounce);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  i18n,
  render: h => h(App),
}).$mount("#app");
