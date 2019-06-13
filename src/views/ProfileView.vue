<template>
  <AdminLayout>
    <div class="container">
      <div class="row align-items-center profile-header">
        <div class="col-md-2">
          <img
            width="200"
            :src="profile.picture"
            alt="User's profile picture"
            class="rounded-circle img-fluid profile-picture"
          >
        </div>
        <div class="col-md">
          <h2>{{ profile.name }}</h2>
          <p class="lead text-muted">{{ profile.email }}</p>
        </div>
      </div>

      <div class="row">
        <pre class="rounded"><code class="json">{{ JSON.stringify(profile, null, 2) }}</code></pre>
      </div>
    </div>
  </AdminLayout>
</template>

<script>
import { getUser } from "../lib/auth";
import AdminLayout from "@/layouts/AdminLayout";
export default {
  components: {
    AdminLayout
  },
  created() {
    this.profile = getUser();
  }
};
</script>
