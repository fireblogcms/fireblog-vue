<template>
  <AdminLayout>
    <div class="container">
      <div class="row align-items-center profile-header">
        <div class="col-md-2">
          <img
            width="200"
            :src="me.picture"
            alt="User's profile picture"
            class="rounded-circle img-fluid profile-picture"
          />
        </div>
        <div class="col-md">
          <h2>{{ me.name }}</h2>
          <p class="lead text-muted">{{ me.email }}</p>
        </div>
      </div>

      <div class="row">
        <pre class="rounded"><code class="json">{{ JSON.stringify(me, null, 2) }}</code></pre>
      </div>
    </div>
  </AdminLayout>
</template>

<script>
import AdminLayout from "@/layouts/AdminLayout";
import podClient from "../lib/podClient";

export default {
  data() {
    return {
      me: {}
    };
  },
  components: {
    AdminLayout
  },
  created() {
    podClient()
      .request(
        `query {
        me {
          _id
          name
          email
          createdAt
          updatedAt
          picture
        }
      }
      `
      )
      .then(result => {
        this.me = result.me;
      });
  }
};
</script>
