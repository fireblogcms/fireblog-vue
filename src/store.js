import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    postJustPublished: false,
    user: null,
    notification: null
  },
  mutations: {
    postJustPublished(state, value) {
      state.postJustPublished = value;
    },
    user(state, value) {
      state.user = value;
    },
    notification(state, { message, type }) {
      state.notification = {
        message,
        type
      };
    }
  }
});
