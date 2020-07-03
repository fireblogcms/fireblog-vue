<template>
  <DefaultLayout>
    <!-- TOPBAR LEFT BUTTONS -->
    <portal to="topbar-left">
      <AppBreadcrumb
        image="/images/book.png"
        link="postList"
        :name="$t('views.postForm.backToBlogLink')"
      />
    </portal>
    <!-- END TOPBAR LEFT BUTTONS -->

    <BlogSettings />
  </DefaultLayout>
</template>

<script>
import AppBreadcrumb from "@/ui-kit/AppBreadcrumb";
import BlogSettings from "@/components/BlogSettings";
import DefaultLayout from "@/layouts/DefaultLayout";

export default {
  components: {
    AppBreadcrumb,
    BlogSettings,
    DefaultLayout,
  },
};
</script>
