import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    postJustPublished: false,
    notification: null,
    postForm: null,
    forms: {}
  },
  mutations: {
    title(state, value) {
      state.title = value;
    },
    formCreate(state, { formId, form }) {
      Vue.set(state.forms, formId, form);
    },
    formUpdate(state, { formId, type, name, value }) {
      if (type === "error") {
        state.forms[formId].errors[name] = value;
      } else {
        state.forms[formId].values[type][name] = value;
      }
    },
    postJustPublished(state, value) {
      state.postJustPublished = value;
    },
    notification(state, { message, type }) {
      state.notification = {
        message,
        type
      };
    }
  }
});
