import Vue from "vue";
import Router from "vue-router";
import HomeView from "./views/HomeView";
import WriteView from "./views/WriteView";
import ProfileView from "./views/ProfileView";
import PodCreateView from "./views/PodCreateView";
import Callback from "./components/Callback.vue";
import Logout from "./components/Logout";
import auth from "./lib/authService";

Vue.use(Router);

const router = new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView
    },
    {
      path: "/pod/:podId/write",
      name: "write",
      component: WriteView
    },
    {
      path: "/pod/new",
      name: "pod",
      component: PodCreateView
    },
    {
      path: "/profile",
      name: "profile",
      component: ProfileView
    },
    {
      path: "/callback",
      name: "callback",
      component: Callback
    },
    {
      path: "/login",
      name: "login",
      component: HomeView
    },
    {
      path: "/logout",
      name: "logout",
      component: Logout
    }
  ]
});

router.beforeEach((to, from, next) => {
  if (
    to.path === "/login" ||
    to.path === "/" ||
    to.path === "/callback" ||
    auth.isAuthenticated()
  ) {
    return next();
  }

  auth.login({ target: to.path });
});

export default router;
