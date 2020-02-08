<template>
  <DefaultLayout>
    <pre>{{ operation() }}</pre>
    <PostForm />
  </DefaultLayout>
</template>

<script>
import PostForm from "@/components/PostForm";
import gql from "graphql-tag";
import DefaultLayout from "../layouts/DefaultLayout";

export default {
  name: "PostFormView",
  components: {
    PostForm,
    DefaultLayout
  },
  methods: {
    operation() {
      if (this.$route.name === "postUpdate") {
        return "UPDATE";
      }
      if (this.$route.name === "postCreate") {
        return "CREATE";
      }
      throw new Error("Operation unknown");
    }
  }
};
</script>
