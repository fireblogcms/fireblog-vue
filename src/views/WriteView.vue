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
      <WriteForm/>
    </div>
  </AdminLayout>
</template>

<script>
// @ is an alias to /src
import WriteForm from "@/components/WriteForm";
import AdminLayout from "@/layouts/AdminLayout";

export default {
  name: "home",
  components: {
    WriteForm,
    AdminLayout
  }
};
</script>
