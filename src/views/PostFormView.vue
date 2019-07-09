<template>
  <AdminLayout>
    <div class="write-view">
      <!--
    <div class="write-menu">
      <div class="item">
        <button class="button">Publish</button>
      </div>
      <div class="item">
        <button class="button">Save</button>
      </div>
      <div class="item">
        <button class="button">API</button>
      </div>
    </div>
      -->
      <PostForm />
    </div>
  </AdminLayout>
</template>

<script>
import PostForm from "@/components/PostForm";
import AdminLayout from "@/layouts/AdminLayout";

export default {
  name: "home",
  components: {
    PostForm,
    AdminLayout
  }
};
</script>
