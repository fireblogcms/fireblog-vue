import Store from "../store";
import Vue from "vue";

/**
 * Store form values inside Vuex store.
 */

/**
 * A custom store module to store all our forms values.
 */
export const moduleForm = {
  state: {},
  mutations: {
    formCreate(state, { formId, form }) {
      Vue.set(state, formId, form);
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
Store.registerModule("forms", moduleForm);

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
      initial: {
        ...initialValues
      },
      current: {
        ...initialValues
      }
    }
  };
}

export function formStorageCreate(formId, { initialValues }) {
  Store.commit("formCreate", {
    formId,
    form: formInitData({ initialValues })
  });
}

export function formStorageUpdate(formId, { type, name = null, value }) {
  Store.commit("formUpdate", { formId, type, name, value });
}

export function formStorageGetValue(formId, name) {
  return Store.state.forms[formId].values.current[name];
}

export function formStorageGetAllValues(formId) {
  return Store.state.forms[formId].values;
}

export function formStorageGetError(formId, name) {
  return Store.state.forms[formId].errors[name];
}

export function formStorageGetAllErrors(formId) {
  return Store.state.forms[formId].errors;
}
