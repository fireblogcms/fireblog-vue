import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

const moduleGlobal = {
  state: {
    comingFromPostCreateRoute: null, // will be a postId
    postJustPublished: null, // will be a postId
    // full post object for last edited post
    lastEditedPost: null,
    notification: null
  },
  mutations: {
    lastEditedPost(state, post) {
      state.lastEditedPost = post;
    },
    comingFromPostCreateRoute(state, postId) {
      state.comingFromPostCreateRoute = postId;
    },
    // we display a special message the first a post is published.
    postJustPublished(state, postId) {
      state.postJustPublished = postId;
    },
    // @see appNotification() function
    notification(state, args) {
      state.notification = args;
    }
  }
};

export default new Vuex.Store({
  modules: {
    global: moduleGlobal
  }
});
