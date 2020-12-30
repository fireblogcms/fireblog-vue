<template>
  <div>
    <AppFieldText label="name" v-model="form.name" />
    <AppFieldText label="slug" v-model="form.slug" class="mt-5" />
    <AppTextarea label="description" v-model="form.description" class="mt-5" />
    <div class="flex justify-end mt-10">
      <AppButton @click="onBackClick">Back</AppButton>
      <AppButton class="ml-5" color="primary">Save</AppButton>
    </div>
  </div>
</template>

<script>
import AppFieldText from "@/ui-kit/AppFieldText";
import AppTextarea from "@/ui-kit/AppTextarea";
import AppButton from "@/ui-kit/AppButton";

function initFormValues(tag) {
  const form = {
    name: tag.name ? tag.name : "",
    description: tag.description ? tag.description : "",
    slug: tag.slug ? tag.slug : "",
  };
  return form;
}

export default {
  components: {
    AppFieldText,
    AppTextarea,
    AppButton,
  },
  props: {
    tag: {
      type: [Object, null],
    },
  },
  data() {
    return {
      form: initFormValues(this.tag),
    };
  },
  methods: {
    onBackClick() {
      this.$router.push({
        name: "blogSettings",
        params: {
          blogId: this.$route.params.blogId,
          blogSetId: this.$route.params.blogSetId,
        },
      });
    },
  },
};
</script>
