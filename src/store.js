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
    // @see formStorageCreate()
    formCreate(state, { formId, form }) {
      Vue.set(state.forms, formId, form);
    },
    // @see formStorageUpdate()
    formUpdate(state, { formId, type, name, value }) {
      if (type === "error") {
        state.forms[formId].errors[name] = value;
      } else {
        state.forms[formId].values[type][name] = value;
      }
    },
    // we display a special message the first a post is published.
    postJustPublished(state, value) {
      state.postJustPublished = value;
    },
    // @see appNotification() function
    notification(state, args) {
      state.notification = args;
    }
  }
});
