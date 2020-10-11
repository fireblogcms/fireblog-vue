export default {
  namespaced: true,
  state: {
    modals: {},
  },
  mutations: {
    open(state, name) {
      window._paq.push(["trackEvent", "Modals", name, "Open"]);
      state.modals = {
        ...state.modals,
        [name]: true,
      };
    },
    close(state, name) {
      window._paq.push(["trackEvent", "Modals", name, "Close"]);
      state.modals = {
        ...state.modals,
        [name]: false,
      };
    },
  },
};
