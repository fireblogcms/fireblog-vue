<template>
  <AdminLayout>
    <div class="container">
      <div class="columns">
        <div class="column">
          <h2>Requête GraphQL</h2>
          <pre>
        {
          posts {
            publishedAt
            createdAt
            status
            title
            content
            authors {
              email
              name
              picture
            }
          }
        }
      </pre>
        </div>
        <div class="column">
          <h2>Code Vue.js</h2>
          <pre></pre>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script>
// @ is an alias to /src
import WriteForm from "@/components/WriteForm.vue";
import AdminLayout from "@/layouts/AdminLayout";

export default {
  name: "home",
  components: {
    WriteForm,
    AdminLayout
  }
};
</script>
