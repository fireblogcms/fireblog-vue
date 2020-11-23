import Store from "@/store";
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
    vuexFormInit(state, { formId, form }) {
      Vue.set(state, formId, form);
    },
    vuexFormSetValue(state, { formId, name, value }) {
      Vue.set(state[formId].values, name, value);
    },
    vuexFormSetValues(state, { formId, values }) {
      Vue.set(state[formId], "values", values);
    },
    vuexFormSetError(state, { formId, name, value }) {
      Vue.set(state[formId].errors, name, value);
    },
    vuexFormSetErrors(state, { formId, errors }) {
      Vue.set(state[formId], "errors", errors);
    },
  },
  actions: {},
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
export function vuexFormInit(
  formId,
  { initialValues, onFormValueChange = () => {} }
) {
  Store.commit("vuexFormInit", {
    formId,
    form: {
      errors: {},
      // those values will change according to user input
      values: {
        ...initialValues,
      },
      // this values won't be changed
      initialValues,
      // this callback is called every time a form value has changed.
      onFormValueChange,
    },
  });
}

/**
 * ============================================
 * Some simple wrappers around store mutations
 * for our form values.
 * ============================================
 */

export function vuexFormGetValue(formId, name) {
  if (!Store.state[formsStoreKey][formId]) {
    throw new Error(
      `"${formId}.${name}": formId ${formId} not found in the store !`
    );
  }
  return Store.state[formsStoreKey][formId].values[name];
}

export function vuexFormGetValues(formId) {
  return Store.state[formsStoreKey][formId].values;
}

export function vuexFormGetInitialValues(formId) {
  return Store.state[formsStoreKey][formId].initialValues;
}

export function vuexFormGetError(formId, name) {
  return Store.state[formsStoreKey][formId].errors[name];
}

export function vuexFormGetErrors(formId) {
  return Store.state[formsStoreKey][formId].errors;
}

export function vuexFormSetValue(formId, name, value) {
  Store.commit("vuexFormSetValue", { formId, name, value });
  Store.state[formsStoreKey][formId].onFormValueChange({ name, value });
}

export function vuexFormSetError(formId, name, value) {
  Store.commit("vuexFormSetError", { formId, name, value });
}

export function vuexFormSetErrors(formId, errors = {}) {
  Store.commit("vuexFormSetErrors", { formId, errors });
}

export function vuexFormResetErrors(formId) {
  Store.commit("vuexFormSetErrors", { formId, errors: {} });
}
