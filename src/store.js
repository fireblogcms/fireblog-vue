import Vue from "vue";
import Vuex from "vuex";
import modalShowing from "@/utils/vueXModalShowing";

Vue.use(Vuex);

const global = {
  state: {
    backgroundImage: "/illustrations/landscape-3.jpg",
    postJustPublished: null, // will be a postId
    // full post object for last edited post
    lastVisitedPost: null,
  },
  mutations: {
    backgroundImage(state, value) {
      state.backgroundImage = value;
    },
    lastVisitedPost(state, post) {
      state.lastVisitedPost = post;
    },
    // we display a special message the first a post is published.
    postJustPublished(state, postId) {
      state.postJustPublished = postId;
    },
  },
};

export default new Vuex.Store({
  modules: {
    global,
    modalShowing,
  },
});
