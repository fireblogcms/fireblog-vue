import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

const moduleGlobal = {
  state: {
    postJustPublished: null, // will be a postId
    // full post object for last edited post
    lastVisitedPost: null
  },
  mutations: {
    lastVisitedPost(state, post) {
      state.lastVisitedPost = post;
    },
    // we display a special message the first a post is published.
    postJustPublished(state, postId) {
      state.postJustPublished = postId;
    }
  }
};

export default new Vuex.Store({
  modules: {
    global: moduleGlobal
  }
});
