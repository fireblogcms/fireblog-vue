import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";
import Write from "./views/Write.vue";

Vue.use(Router);

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "home",
      component: Home
    },
    {
      path: "/pod/:podId/post/:operation",
      name: "write",
      component: Write
    }
  ]
});
