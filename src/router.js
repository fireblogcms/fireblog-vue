import Vue from 'vue';
import Router from 'vue-router';
import PostFormView from './views/PostFormView';
import ProfileView from './views/ProfileView';
import BlogCreateView from './views/BlogCreateView';
import BlogListView from './views/BlogListView';
import BlogSettingsView from './views/BlogSettingsView';
import PostListView from './views/PostListView';
import PostProofreadView from './views/PostProofreadView';
import NotFoundView from './views/NotFoundView';
import Auth0CallbackView from './views/Auth0CallbackView.vue';
import AccessTokenErrorView from './views/AccessTokenErrorView.vue';
import LogoutView from './views/LogoutView';
import LoginView from './views/LoginView';
import { auth0Client } from './utils/auth';

Vue.use(Router);

Router.prototype.newTab = function(routeObject) {
  const { href } = this.resolve(routeObject);
  window.open(href, '_blank');
};

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'blogList',
      component: BlogListView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: {
        public: true,
      },
    },
    {
      path: '/auth0-callback',
      name: 'auth0Callback',
      component: Auth0CallbackView,
      meta: {
        public: true,
      },
    },
    {
      path: '/blog/create',
      name: 'blogCreate',
      component: BlogCreateView,
    },
    {
      path: '/blog/:blogId',
      name: 'postList',
      component: PostListView,
    },
    {
      path: '/blog/:blogId/settings',
      name: 'blogSettings',
      component: BlogSettingsView,
    },
    {
      path: '/blog/:blogId/post/create',
      name: 'postCreate',
      component: PostFormView,
    },
    {
      path: '/blog/:blogId/post/:postId',
      name: 'postUpdate',
      component: PostFormView,
    },
    {
      path: '/blog/:blogId/post/:postId/proofread',
      name: 'postProofread',
      component: PostProofreadView,
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
    },
    {
      path: '/logout',
      name: 'logout',
      component: LogoutView,
    },
    {
      path: '/access-token-error',
      name: 'accessTokenError',
      component: AccessTokenErrorView,
    },
    {
      path: '*',
      component: NotFoundView,
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  const auth0 = await auth0Client();
  const isAuthenticated = await auth0.isAuthenticated();

  // if route is public,do not check authentication
  if (to.matched.some((route) => route.meta.public === true)) {
    next();
  }

  // user is already authenticated
  else if (isAuthenticated) {
    auth0.getUser().then((user) => {
      if ($crisp) {
        // prefill email field from currently logged in user.
        $crisp.push(['set', 'user:email', [user.email]]);
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
      redirect_uri: `${process.env.VUE_APP_BASE_URL}/auth0-callback`,
    });
  }
});

export default router;
