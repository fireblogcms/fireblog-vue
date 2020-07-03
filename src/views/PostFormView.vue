<template>
  <DefaultLayout>
    <PostForm @onEdit="postFormIsEdited = $event" />
  </DefaultLayout>
</template>

<script>
import PostForm from "@/components/PostForm";
import DefaultLayout from "@/layouts/DefaultLayout";

export default {
  components: {
    PostForm,
    DefaultLayout,
  },
  data() {
    return {
      postFormIsEdited: false,
    };
  },
  beforeRouteLeave(to, from, next) {
    if (
      this.postFormIsEdited &&
      !window.confirm(this.$t("views.postForm.alertLeavePage"))
    ) {
      next(false);
    } else {
      next();
    }
  },
};
</script>
