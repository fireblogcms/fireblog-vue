<template>
  <div :style="style" class="flex flex-col min-h-screen">
    <AppTopbar v-show="isTopbarVisible()" />
    <div class="flex-1">
      <slot />
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
      return {
        background: `url("${this.$store.state.global.wallpaper}")  no-repeat center / cover`,
      };
    },
  },
  watch: {
    $route: {
      handler: function(value) {
        if (this.$route.params.blogId) {
          getBlog(this.$route.params.blogId).then(blog => {
            this.$store.commit("wallpaper", blog.wallpaper);
          });
        }
      },
      immediate: true,
    },
  },
};
</script>
