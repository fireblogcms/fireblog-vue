import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";
import Write from "./views/Write.vue";
import Profile from "./views/Profile.vue";
import Logout from "./components/Logout.vue";
import Callback from "./components/Callback.vue";
import auth from "./auth/authService";

Vue.use(Router);

const router = new Router({
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
    },
    {
      path: "/profile",
      name: "profile",
      component: Profile
    },
    {
      path: "/callback",
      name: "callback",
      component: Callback
    },
    {
      path: "/login",
      name: "login",
      component: Home
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
