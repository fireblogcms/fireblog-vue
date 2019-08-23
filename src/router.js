import Vue from "vue";
import Router from "vue-router";
import PostFormView from "./views/PostFormView";
import ProfileView from "./views/ProfileView";
import PodCreateView from "./views/PodCreateView";
import BlogListView from "./views/BlogListView";
import postListView from "./views/postListView";
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
      name: "blogList",
      component: BlogListView
    },
    {
      path: "/auth0-callback",
      name: "auth0Callback",
      component: Callback,
      meta: {
        public: true
      }
    },
    {
      path: "/blog/create",
      name: "blogCreate",
      component: PodCreateView
    },
    {
      path: "/blog/:blogId",
      name: "postList",
      component: postListView
    },
    {
      path: "/blog/:blogId/post/create",
      name: "postCreate",
      component: PostFormView
    },
    {
      path: "/blog/:blogId/post/:postId",
      name: "postUpdate",
      component: PostFormView
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
