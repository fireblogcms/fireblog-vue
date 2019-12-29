import Store from "../store";
import Vue from "vue";

export const formsStoreKey = "forms";

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
    }
  },
  actions: {}
};

/**
 * Register dynamically our module inside Vuex store.
 */
Store.registerModule(formsStoreKey, moduleForm);

/**
 * Helper to handle correctly form values in Vue component
 * 1) "initialValues" are the value loaded initially for the form. They never
 *    change during the lifetime of the form.
 * 2) "values" are the one entered or modified by the user.
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

/**
 * ============================================
 * Some simple wrappers around store mutations
 * for our form values.
 * ============================================
 */

export function formGetValue(formId, name) {
  return Store.state[formsStoreKey][formId].values[name];
}

export function formGetValues(formId) {
  return Store.state[formsStoreKey][formId].values;
}

export function formGetInitialValues(formId) {
  return Store.state[formsStoreKey][formId].initialValues;
}

export function formGetError(formId, name) {
  return Store.state[formsStoreKey][formId].errors[name];
}

export function formGetErrors(formId) {
  return Store.state[formsStoreKey][formId].errors;
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

export function formResetErrors(formId) {
  Store.commit("formSetErrors", { formId, errors: {} });
}
