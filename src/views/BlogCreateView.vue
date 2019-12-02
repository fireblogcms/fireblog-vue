<template>
  <DefaultLayout class="container is-small">
    <BlogCreateForm />
  </DefaultLayout>
</template>

<script>
import BlogCreateForm from "../components/BlogCreateForm";
import DefaultLayout from "../layouts/DefaultLayout";

export default {
  components: {
    BlogCreateForm,
    DefaultLayout
  }
};
</script>
