<template>
  <DefaultLayout>
    <!-- TOPBAR LEFT BUTTONS -->
    <portal to="topbar-left">
      <span class="item tag is-large">
        <router-link class="item" :to="{ name: 'blogList' }">
          <img
            class="is-hidden-mobile"
            style="position:relative;height:20px !important;top:4px;"
            src="/images/books.webp"
          />
          <IconBack />
          {{ $t("views.postList.backToBlogLink") }}
        </router-link>
      </span>
    </portal>
    <!-- END TOPBAR LEFT BUTTONS -->

    <BlogSettings />
  </DefaultLayout>
</template>

<script>
import BlogSettings from "@/components/BlogSettings";
import IconBack from "@/components/IconBack";
import { REQUEST_STATE } from "@/utils/helpers";
import DefaultLayout from "@/layouts/DefaultLayout";

export default {
  components: {
    IconBack,
    BlogSettings,
    DefaultLayout
  }
};
</script>
