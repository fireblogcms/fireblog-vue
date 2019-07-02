<template>
  <div class="content-view">
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
    <PostForm />
  </div>
</template>

<script>
// @ is an alias to /src
import PostForm from "@/components  PostForm.vue";

export default {
  name: "home",
  components: {
    PostForm
  }
};
</script>
