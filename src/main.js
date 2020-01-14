import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import VueTextareaAutosize from "vue-textarea-autosize";
import "bulma/css/bulma.css";
import PortalVue from "portal-vue";
import vClickOutside from "v-click-outside";
import "animate.css/animate.min.css";
import VueLazyload from "vue-lazyload";
import i18n from "./i18n/index";
import Toasted from "vue-toasted";

Vue.use(VueLazyload);
Vue.use(vClickOutside);
Vue.use(PortalVue);
Vue.use(VueTextareaAutosize);
Vue.use(Toasted);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount("#app");
