<template>
  <div>
    <div :style="style" class="h-screen w-screen fixed border-gray-100"></div>
    <div class="flex flex-col min-h-screen relative">
      <AppTopbar v-show="isTopbarVisible()" />
      <div class="flex-1">
        <slot />
      </div>
    </div>
  </div>
</template>

<script>
import AppTopbar from "@/ui-kit/AppTopbar";
import { getBlog } from "@/utils/helpers";

export default {
  components: {
    AppTopbar,
  },
  data() {
    return {
      wallpaper: null,
    };
  },
  methods: {
    isTopbarVisible() {
      const hideForRoutes = ["auth0Callback"];
      return !hideForRoutes.includes(this.$route.name);
    },
  },
  computed: {
    style() {
      const style = {};
      if (this.$store.state.global.wallpaper) {
        style.background = `url("${this.$store.state.global.wallpaper}")  no-repeat center / cover`;
      }
      return style;
    },
  },
  watch: {
    $route: {
      handler: function(value) {
        if (this.$route.params.blogId) {
          getBlog(this.$route.params.blogId).then(blog => {
            this.$store.commit("wallpaper", blog.wallpaper);
          });
        } else {
          this.$store.commit("wallpaper", null);
        }
      },
      immediate: true,
    },
  },
};
</script>
