import Vue from "vue";
import Router from "vue-router";
import PostFormView from "./views/PostFormView";
import ProfileView from "./views/ProfileView";
import BlogCreateView from "./views/BlogCreateView";
import BlogListView from "./views/BlogListView";
import PostListView from "./views/PostListView";
import NotFoundView from "./views/NotFoundView";
import Auth0CallbackView from "./views/Auth0CallbackView.vue";
import Logout from "./components/Logout";
import { isAuthenticated, auth0client } from "./lib/auth";

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
      component: Auth0CallbackView,
      meta: {
        public: true
      }
    },
    {
      path: "/blog/create",
      name: "blogCreate",
      component: BlogCreateView
    },
    {
      path: "/blog/:blogId",
      name: "postList",
      component: PostListView
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
  // if route is public,do not check authentication
  if (to.matched.some(record => record.meta.public === true)) {
    console.log("auth0: public route");
    next();
  }
  // user is already authenticated
  else if (isAuthenticated()) {
    console.log("auth0: user is already authenticated");
    next();
  }
  // in all other cases, user must be authenticated.
  else {
    console.log("Auth0 : User authorization control");
    auth0client.authorize({ target: to.path });
    next(false);
  }
});

export default router;
