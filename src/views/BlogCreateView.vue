<template>
  <AdminLayout>
    <div class="container">
      <BlogCreateForm />
    </div>
  </AdminLayout>
</template>

<script>
import BlogCreateForm from "../components/BlogCreateForm";
import AdminLayout from "@/layouts/AdminLayout";
import LayoutBody from "../components/LayoutBody";

export default {
  components: {
    BlogCreateForm,
    AdminLayout,
    LayoutBody
  }
};
</script>
