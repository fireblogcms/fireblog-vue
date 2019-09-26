<template>
  <DefaultLayout>
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
  </DefaultLayout>
</template>

<script>
import DefaultLayout from "@/layouts/DefaultLayout";

export default {
  name: "home",
  components: {
    DefaultLayout
  }
};
</script>
