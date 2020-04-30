<template>
  <DefaultLayout>
    <!-- TOPBAR LEFT BUTTONS -->
    <portal to="topbar-left">
      <AppBreadcrumb
        image="/images/books.png"
        link="blogList"
        :name="$t('views.postList.backToBlogLink')"
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
    DefaultLayout
  }
};
</script>
