<template>
  <div>
    <!-- TOPBAR LEFT BUTTONS -->
    <portal to="topbar-left">
      <span class="item tag is-large">
        <router-link class="item" :to="{ name: 'blogList' }">
          <img
            class="is-hidden-mobile"
            style="position:relative;height:20px !important;top:4px;"
            src="/images/books.webp"
          />
          <IconBack />My blogs
        </router-link>
      </span>
    </portal>
    <!-- END TOPBAR LEFT BUTTONS -->

    <BlogSettingsForm />
  </div>
</template>

<script>
import BlogSettingsForm from "../components/BlogSettingsForm";
import IconBack from "../components/IconBack";
import { REQUEST_STATE } from "../utils/helpers";

export default {
  components: {
    IconBack,
    BlogSettingsForm
  }
};
</script>
