import Vue from "vue";
import Vuex from "vuex";
import modalShowing from "@/utils/vueXModalShowing";

Vue.use(Vuex);

const global = {
  state: {
    wallpaper: null,
  },
  mutations: {
    wallpaper(state, value) {
      state.wallpaper = value;
    },
  },
};

export default new Vuex.Store({
  modules: {
    global,
    modalShowing,
  },
});
