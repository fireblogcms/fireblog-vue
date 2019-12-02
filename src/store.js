import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    postJustPublished: false,
    user: null
  },
  mutations: {
    postJustPublished(state, value) {
      state.postJustPublished = value;
    },
    user(state, value) {
      state.user = value;
    }
  }
});
