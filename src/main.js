import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import VueTextareaAutosize from "vue-textarea-autosize";
import AuthPlugin from "./plugins/auth";
import "bulma/css/bulma.css";

Vue.use(VueTextareaAutosize);
Vue.use(AuthPlugin);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
