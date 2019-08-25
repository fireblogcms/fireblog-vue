<template>
  <AdminLayout>
    <div class="container section">
      <LayoutBody>
        <PodCreateForm />
      </LayoutBody>
    </div>
  </AdminLayout>
</template>

<script>
import { generate } from "../lib/fantasyName.js";
import apolloClient from "../lib/apolloClient";
import { getUser } from "../lib/auth";
import PodCreateForm from "../components/PodCreateForm";
import AdminLayout from "@/layouts/AdminLayout";
import LayoutBody from "../components/LayoutBody";

const user = getUser();

export default {
  components: {
    PodCreateForm,
    AdminLayout,
    LayoutBody
  }
};
</script>
