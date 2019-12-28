import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

const moduleGlobal = {
  state: {
    postJustPublished: false,
    notification: null
  },
  mutations: {
    // we display a special message the first a post is published.
    postJustPublished(state, value) {
      state.postJustPublished = value;
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
