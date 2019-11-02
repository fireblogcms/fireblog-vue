import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import VueTextareaAutosize from 'vue-textarea-autosize';
import 'bulma/css/bulma.css';
import 'bulma-tooltip';
import PortalVue from 'portal-vue';
import vClickOutside from 'v-click-outside';
import 'animate.css/animate.min.css';
import 'vue-loading-overlay/dist/vue-loading.css';
import VueLazyload from 'vue-lazyload';

Vue.use(VueLazyload);
Vue.use(vClickOutside);
Vue.use(PortalVue);
Vue.use(VueTextareaAutosize);
Vue.use(require('vue-moment'));

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
