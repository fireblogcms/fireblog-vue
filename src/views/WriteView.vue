<template>
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
    <WriteForm />
  </div>
</template>

<script>
// @ is an alias to /src
import WriteForm from "@/components/WriteForm.vue";

export default {
  name: "home",
  components: {
    WriteForm
  }
};
</script>
