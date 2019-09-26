<template>
  <DefaultLayout>
    <div class="container">
      <BlogCreateForm />
    </div>
  </DefaultLayout>
</template>

<script>
import BlogCreateForm from "../components/BlogCreateForm";
import DefaultLayout from "@/layouts/DefaultLayout";

export default {
  components: {
    BlogCreateForm,
    DefaultLayout
  }
};
</script>
