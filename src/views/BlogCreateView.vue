<template>
  <DefaultLayout>
    <AppPanel class="max-w-4xl mx-auto">
      <BlogCreateForm />
    </AppPanel>
  </DefaultLayout>
</template>

<script>
import AppPanel from "@/ui-kit/AppPanel";
import BlogCreateForm from "@/components/BlogCreateForm";
import DefaultLayout from "@/layouts/DefaultLayout";

export default {
  components: {
    AppPanel,
    BlogCreateForm,
    DefaultLayout,
  },
};
</script>
