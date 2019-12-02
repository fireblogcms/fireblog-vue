<template>
  <div>
    <PostForm />
  </div>
</template>

<script>
import PostForm from "@/components/PostForm";
import gql from "graphql-tag";

export default {
  name: "PostFormView",
  components: {
    PostForm
  }
};
</script>
