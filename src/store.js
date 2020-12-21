import Vue from "vue";
import Vuex from "vuex";
import modalShowing from "@/utils/vueXModalShowing";

Vue.use(Vuex);

const global = {
  state: {
    wallpaper: "/wallpapers/wallpaper-1.jpg",
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
