<template>
  <AdminLayout>
    <div class="pod-view">
      <PodCreateForm/>
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
