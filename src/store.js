import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    postJustPublished: false,
    notification: null,
    postForm: null
  },
  mutations: {
    postJustPublished(state, value) {
      state.postJustPublished = value;
    },
    notification(state, { message, type }) {
      state.notification = {
        message,
        type
      };
    },
    postForm(state, value) {
      state.postForm = value;
    },
    postFormUpdate(state, { type, name, value }) {
      if (type === "error") {
        state.postForm.errors[name] = value;
      } else {
        state.postForm.values[type][name] = value;
      }
    }
  }
});
