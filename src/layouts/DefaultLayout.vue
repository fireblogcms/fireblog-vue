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
      style: {},
      blog: null,
    };
  },
  methods: {
    isTopbarVisible() {
      const hideForRoutes = ["auth0Callback"];
      return !hideForRoutes.includes(this.$route.name);
    },
  },
  watch: {
    $route: {
      handler: function(value) {
        if (this.$route.params.blogId) {
          getBlog(this.$route.params.blogId).then(blog => {
            this.blog = blog.backgroundImage;
            if (this.backgroundImage != blog.backgroundImage) {
              this.style = {
                background: `center / cover url("${blog.backgroundImage}")`,
              };
            }
          });
        } else {
          this.style = {};
        }
      },
      immediate: true,
    },
  },
};
</script>
