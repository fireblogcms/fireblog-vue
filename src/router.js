import Vue from "vue";
import Router from "vue-router";
import HomeView from "./views/HomeView";
import PostWriteView from "./views/WriteView";
import ProfileView from "./views/ProfileView";
import PodCreateView from "./views/PodCreateView";
import Pods from "./views/Pods";
import PodView from "./views/PodView";
import PostApiView from "./views/PostApiView";
import NotFoundView from "./views/NotFoundView";
import Callback from "./components/Callback.vue";
import Logout from "./components/Logout";
import { auth0RouterMiddleware } from "./lib/auth";

Vue.use(Router);

const router = new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
      meta: {
        public: true
      }
    },
    {
      path: "/callback",
      name: "callback",
      component: Callback,
      meta: {
        public: true
      }
    },
    {
      path: "/pod/create",
      name: "pod",
      component: PodCreateView
    },
    {
      path: "/pod/:podId",
      component: PodView
    },
    {
      path: "/pod/:podId/write/post",
      name: "postWrite",
      component: PostWriteView
    },
    {
      path: "/pod/:podId/write/post/api",
      name: "postApi",
      component: PostApiView
    },
    {
      path: "/pod/:podId/write/post/:postId",
      name: "postEdit",
      component: PostWriteView
    },
    {
      path: "/pods",
      name: "pods",
      component: Pods
    },
    {
      path: "/profile",
      name: "profile",
      component: ProfileView
    },
    {
      path: "/logout",
      name: "logout",
      component: Logout
    },
    {
      path: "*",
      component: NotFoundView
    }
  ]
});

router.beforeEach((to, from, next) => {
  auth0RouterMiddleware(to, from, next);
});

export default router;
