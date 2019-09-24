<template>
  <AdminLayout>
    <PostForm />
  </AdminLayout>
</template>

<script>
import PostForm from "@/components/PostForm";
import AdminLayout from "@/layouts/AdminLayout";
import gql from "graphql-tag";

export default {
  name: "PostFormView",
  components: {
    PostForm,
    AdminLayout
  }
};
</script>
