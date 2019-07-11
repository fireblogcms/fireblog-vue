<template>
  <AdminLayout>
    <div class="container section">
      <div class="pod-container">
        <PodCreateForm />
      </div>
    </div>
  </AdminLayout>
</template>

<script>
import { generate } from "../lib/fantasyName.js";
import podClient from "../lib/podClient";
import { getUser } from "../lib/auth";
import PodCreateForm from "../components/PodCreateForm";
import AdminLayout from "@/layouts/AdminLayout";

const user = getUser();

export default {
  components: {
    PodCreateForm,
    AdminLayout
  }
};
</script>
