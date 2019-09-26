<template>
  <DefaultLayout>
    <PostForm />
  </DefaultLayout>
</template>

<script>
import PostForm from "@/components/PostForm";
import DefaultLayout from "@/layouts/DefaultLayout";
import gql from "graphql-tag";

export default {
  name: "PostFormView",
  components: {
    PostForm,
    DefaultLayout
  }
};
</script>
