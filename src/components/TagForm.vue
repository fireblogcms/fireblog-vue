<template>
  <div>
    <AppFieldText label="name" v-model="formValues.name" />
    <AppFieldText label="slug" v-model="formValues.slug" class="mt-5" />
    <AppTextarea
      label="description"
      v-model="formValues.description"
      class="mt-5"
    />
    <AppFieldColor label="Color" v-model="formValues.color" class="mt-5" />
    <AppFieldText
      label="SEO meta title"
      v-model="formValues.metaTitle"
      class="mt-5"
    />
    <AppFieldText
      label="SEO meta description"
      v-model="formValues.metaDescription"
      class="mt-5"
    />
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
import AppFieldColor from "@/ui-kit/AppFieldColor";

function initFormValues(tag) {
  const form = {
    name: tag.name ? tag.name : "",
    color: tag.color ? tag.color : "",
    description: tag.description ? tag.description : "",
    slug: tag.slug ? tag.slug : "",
    metaTitle: tag.metaTitle ? tag.metaTitle : "",
    metaDescription: tag.metaDescription ? tag.metaDescription : "",
  };
  return form;
}

export default {
  components: {
    AppFieldText,
    AppTextarea,
    AppButton,
    AppFieldColor,
  },
  props: {
    tag: {
      type: [Object, null],
    },
  },
  data() {
    return {
      formValues: initFormValues(this.tag),
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
