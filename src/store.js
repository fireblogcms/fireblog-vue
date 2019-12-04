import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    postJustPublished: false,
    me: null,
    notification: null
  },
  mutations: {
    postJustPublished(state, value) {
      state.postJustPublished = value;
    },
    me(state, value) {
      state.me = value;
    },
    notification(state, { message, type }) {
      state.notification = {
        message,
        type
      };
    }
  }
});
