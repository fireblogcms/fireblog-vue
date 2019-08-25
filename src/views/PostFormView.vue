<template>
  <AdminLayout>
    <div data-aos="fade-in" class="write-view animated fadeIn">
      <PostForm />
    </div>
  </AdminLayout>
</template>

<script>
import apolloClient from "../lib/apolloClient";
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
