import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: null,
    postJustPublished: false
  },
  mutations: {
    postJustPublished(state, value) {
      state.postJustPublished = value;
    }
  }
});
