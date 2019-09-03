import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import VueTextareaAutosize from "vue-textarea-autosize";
import "bulma/css/bulma.css";
import PortalVue from "portal-vue";
import vClickOutside from "v-click-outside";
import "animate.css/animate.min.css";
import * as Sentry from "@sentry/browser";
import * as Integrations from "@sentry/integrations";

Sentry.init({
  dsn: process.env.VUE_APP_SENTRY_URL,
  integrations: [new Integrations.Vue({ Vue, attachProps: true })]
});

Vue.use(vClickOutside);
Vue.use(PortalVue);
Vue.use(VueTextareaAutosize);
Vue.use(require("vue-moment"));

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
