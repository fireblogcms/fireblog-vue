import Vue from "vue";
import Router from "vue-router";
import { auth0Client } from "./utils/auth";

const PostFormView = () =>
  import(/* webpackChunkName: "PostFormView" */ "./views/PostFormView");
const ProfileView = () =>
  import(/* webpackChunkName: "ProfileView" */ "./views/ProfileView");
const BlogCreateView = () =>
  import(/* webpackChunkName: "BlogCreateView" */ "./views/BlogCreateView");
// BlogListView not used anymore because only one blogset possible for now.
const BlogListView = () =>
  import(/* webpackChunkName: "BlogListView" */ "./views/BlogListView");
const BlogSetListView = () =>
  import(/* webpackChunkName: "BlogSetListView" */ "./views/BlogSetListView");
const BlogSettingsView = () =>
  import(/* webpackChunkName: "BlogSettingsView" */ "./views/BlogSettingsView");
const PostListView = () =>
  import(/* webpackChunkName: "PostListView" */ "./views/PostListView");
const NotFoundView = () =>
  import(/* webpackChunkName: "NotFoundView" */ "./views/NotFoundView");
const Auth0CallbackView = () =>
  import(
    /* webpackChunkName: "Auth0CallbackView" */ "./views/Auth0CallbackView.vue"
  );
const LogoutView = () =>
  import(/* webpackChunkName: "LogoutView" */ "./views/LogoutView");
const LoginView = () =>
  import(/* webpackChunkName: "LoginView" */ "./views/LoginView");
const TestView = () =>
  import(/* webpackChunkName: "TestView" */ "./views/TestView");
const PlansView = () =>
  import(/* webpackChunkName: "PlansView" */ "./views/PlansView");

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
      name: "blogSetList",
      component: BlogSetListView,
    },
    // DOT NOT REMOVE: used for e2e:test
    {
      path: "/test",
      name: "test",
      component: TestView,
      meta: {
        public: true,
      },
    },
    {
      path: "/login",
      name: "login",
      component: LoginView,
      meta: {
        public: true,
      },
    },
    {
      path: "/auth0-callback",
      name: "auth0Callback",
      component: Auth0CallbackView,
      meta: {
        public: true,
      },
    },
    {
      path: "/blogset/:blogSetId/blog/create",
      name: "blogCreate",
      component: BlogCreateView,
    },
    {
      path: "/blogset/:blogSetId/blog/:blogId",
      name: "postList",
      component: PostListView,
    },
    {
      path: "/blogset/:blogSetId/blog/:blogId/settings",
      name: "blogSettings",
      component: BlogSettingsView,
    },
    {
      path: "/blogset/:blogSetId/blog/:blogId/post/create",
      name: "postCreate",
      component: PostFormView,
    },
    {
      path: "/blogset/:blogSetId/blog/:blogId/post/:postId",
      name: "postUpdate",
      component: PostFormView,
    },
    {
      path: "/blog/:blogId/plans",
      name: "plans",
      component: PlansView,
    },
    {
      path: "/profile",
      name: "profile",
      component: ProfileView,
    },
    {
      path: "/logout",
      name: "logout",
      component: LogoutView,
    },
    {
      path: "*",
      component: NotFoundView,
    },
  ],
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
    next();
  }
  // in all other cases, user must be authenticated.
  else {
    // abort the current navigation.
    next(false);
    //  orce authentication.
    await auth0.loginWithRedirect({
      redirect_uri: `${process.env.VUE_APP_BASE_URL}/auth0-callback`,
    });
  }
});

export default router;
