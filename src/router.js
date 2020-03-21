import Vue from "vue";
import Router from "vue-router";
import Store from "./store";
import { auth0Client } from "./utils/auth";
const PostFormView = () => import("./views/PostFormView");
const ProfileView = () => import("./views/ProfileView");
const BlogCreateView = () => import("./views/BlogCreateView");
const BlogListView = () => import("./views/BlogListView");
const BlogSettingsView = () => import("./views/BlogSettingsView");
const PostListView = () => import("./views/PostListView");
const NotFoundView = () => import("./views/NotFoundView");
const Auth0CallbackView = () => import("./views/Auth0CallbackView.vue");
const LogoutView = () => import("./views/LogoutView");
const LoginView = () => import("./views/LoginView");
const PlansView = () => import("./views/PlansView");

Vue.use(Router);

Router.prototype.newTab = function(routeObject) {
  const { href } = this.resolve(routeObject);
  window.open(href, "_blank");
};

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
      path: "/login",
      name: "login",
      component: LoginView,
      meta: {
        public: true
      }
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
      path: "/blog/:blogId/settings",
      name: "blogSettings",
      component: BlogSettingsView
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
      path: "/blog/:blogId/plans",
      name: "plans",
      component: PlansView
    },
    {
      path: "/profile",
      name: "profile",
      component: ProfileView
    },
    {
      path: "/logout",
      name: "logout",
      component: LogoutView
    },
    {
      path: "*",
      component: NotFoundView
    }
  ]
});

router.beforeEach(async (to, from, next) => {
  const auth0 = await auth0Client();
  const isAuthenticated = await auth0.isAuthenticated();

  // if route is public,do not check authentication
  if (to.matched.some(route => route.meta.public === true)) {
    next();
  }

  // user is already authenticated
  else if (isAuthenticated) {
    auth0.getUser().then(user => {
      if ($crisp) {
        // prefill email field from currently logged in user.
        $crisp.push(["set", "user:email", [user.email]]);
      }
    });
    next();
  }
  // in all other cases, user must be authenticated.
  else {
    // abort the current navigation.
    next(false);
    //  orce authentication.
    await auth0.loginWithRedirect({
      redirect_uri: `${process.env.VUE_APP_BASE_URL}/auth0-callback`
    });
  }
});

router.afterEach((to, from, next) => {
  // clear notification on route Change, unless persistAfterRouteChange is requested..
  if (Store.state.global.notification) {
    if (
      Store.state.global.notification.options &&
      !Store.state.global.notification.options.persistAfterRouteChange
    ) {
      Store.commit("notification", null);
    }
  }
});

export default router;
