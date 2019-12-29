import Store from "../store";
import Vue from "vue";

const storeFormsKey = "forms";

/**
 * All our forms values will be stored inside a "forms" key
 * inside Vuex store. E.g:
 * - forms
 *   - postForm
 *      - values:
 *        - title: "hello"
 *        - content: "world"
 *      - errors:
 *        - title: ["title must contains at least two words"]
 */
export const moduleForm = {
  state: {},
  mutations: {
    formInit(state, { formId, form }) {
      Vue.set(state, formId, form);
    },
    formSetValue(state, { formId, name, value }) {
      Vue.set(state[formId].values, name, value);
    },
    formSetValues(state, { formId, values }) {
      Vue.set(state[formId], "values", values);
    },
    formSetError(state, { formId, name, value }) {
      Vue.set(state[formId].errors, name, value);
    },
    formSetErrors(state, { formId, errors }) {
      Vue.set(state[formId], "errors", errors);
    },
    formUpdate(state, { formId, type, name, value }) {
      if (type === "errors") {
        Vue.set(state[formId], "errors", value);
      }
      if (type === "error") {
        Vue.set(state[formId].errors, name, value);
      }
      if (type === "current") {
        Vue.set(state[formId].values.current, name, value);
      }
      if (type === "initial") {
        Vue.set(state[formId].values.initial, name, value);
      }
    }
  },
  actions: {}
};

/**
 * Register dynamically our module inside Vuex store.
 */
Store.registerModule(storeFormsKey, moduleForm);

/**
 * Helper to handle correctly form values in Vue component
 * 1) initialFormValues are the value loaded initially for the form. They never
 *    change during the lifetime of the form.
 * 2) "current" values are the one entered or modified by the user.
 *    Those are the values we want to submit..
 * @param {*} param0
 */
export function formInitData({ initialValues }) {
  return {
    errors: {},
    values: {
      ...initialValues
    },
    initialValues
  };
}

export function formInit(formId, { initialValues }) {
  Store.commit("formInit", {
    formId,
    form: formInitData({ initialValues })
  });
}

export function formUpdate(formId, { type, name = null, value }) {
  Store.commit("formUpdate", { formId, type, name, value });
}

export function formGetValue(formId, name) {
  return Store.state[storeFormsKey][formId].values[name];
}

export function formGetAllValues(formId) {
  return Store.state[storeFormsKey][formId].values;
}

export function formGetError(formId, name) {
  return Store.state[storeFormsKey][formId].errors[name];
}

export function formGetAllErrors(formId) {
  return Store.state[storeFormsKey][formId].errors;
}

export function formSetValue(formId, name, value) {
  Store.commit("formSetValue", { formId, name, value });
}

export function formSetError(formId, name, value) {
  Store.commit("formSetError", { formId, name, value });
}

export function formSetErrors(formId, errors = {}) {
  Store.commit("formSetErrors", { formId, errors });
}
