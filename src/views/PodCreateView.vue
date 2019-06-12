<template>
  <div class="pod-view">
    <PodCreateForm/>
  </div>
</template>

<script>
import { generate } from "../lib/fantasyName.js";
import podClient from "../lib/podClient";
import { getUser } from "../lib/auth";
import PodCreateForm from "../components/PodCreateForm";

const user = getUser();

export default {
  components: {
    PodCreateForm
  }
};
</script>
