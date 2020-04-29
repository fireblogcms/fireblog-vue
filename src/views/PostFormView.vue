<template>
  <DefaultLayout>
    <PostForm />
  </DefaultLayout>
</template>

<script>
import PostForm from "@/components/PostForm";
import DefaultLayout from "@/layouts/DefaultLayout";

export default {
  name: "PostFormView",
  components: {
    PostForm,
    DefaultLayout
  }
};
</script>
