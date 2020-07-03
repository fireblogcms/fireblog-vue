export default {
  namespaced: true,
  state: {
    modals: {},
  },
  mutations: {
    open(state, name) {
      state.modals = {
        ...state.modals,
        [name]: true,
      };
    },
    close(state, name) {
      state.modals = {
        ...state.modals,
        [name]: false,
      };
    },
  },
};
