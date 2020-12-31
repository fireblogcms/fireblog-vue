<template>
  <div>
    <AppFieldText
      label="name"
      v-model="formValues.name"
      :error="formErrors.name"
    />
    <AppFieldText
      label="slug"
      v-model="formValues.slug"
      :error="formErrors.slug"
      class="mt-5"
    />
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
    <div class="font-bold mt-5">Image</div>
    <S3ImageUpload
      label="Image"
      :blogId="$route.params.blogId"
      :initialImage="formValues.image"
    />
    <div class="flex justify-end mt-10">
      <AppButton @click="onBackClick">Back</AppButton>
      <AppButton @click="onSubmitClick" class="ml-5" color="primary">{{
        tag ? "Save" : "Create"
      }}</AppButton>
    </div>
  </div>
</template>

<script>
import AppFieldText from "@/ui-kit/AppFieldText";
import AppTextarea from "@/ui-kit/AppTextarea";
import S3ImageUpload from "@/ui-kit/S3ImageUpload";
import AppButton from "@/ui-kit/AppButton";
import AppFieldColor from "@/ui-kit/AppFieldColor";
import { toast } from "@/utils/helpers";
import apolloClient from "@/utils/apolloClient";
import gql from "graphql-tag";

function initFormValues({ tag, $route }) {
  const form = {
    _id: (tag && tag._id) || "",
    blog: $route.params.blogId || "",
    name: (tag && tag.name) || "",
    color: (tag && tag.color) || "",
    description: (tag && tag.description) || "",
    slug: (tag && tag.slug) || "",
    metaTitle: (tag && tag.metaTitle) || "",
    metaDescription: (tag && tag.metaDescription) || "",
  };
  return form;
}

export default {
  components: {
    AppFieldText,
    AppTextarea,
    AppButton,
    AppFieldColor,
    S3ImageUpload,
  },
  props: {
    tag: {
      type: [Object, null],
    },
  },
  data() {
    return {
      formValues: initFormValues({ tag: this.tag, $route: this.$route }),
      formErrors: {},
      saveTagState: "NOT_STARTED",
    };
  },
  methods: {
    onBackClick() {
      this.$router.push({
        name: "tagList",
        params: {
          blogId: this.$route.params.blogId,
          blogSetId: this.$route.params.blogSetId,
        },
      });
    },
    validateForm() {
      this.formErrors = {};
      if (!this.formValues.name.trim()) {
        const message = "Field name is required";
        this.formErrorxs.name = message;
        toast(this, message, "error");
      }
      if (!this.formValues.slug.trim()) {
        const message = "Field slug is required";
        this.formErrors.slug = message;
        toast(this, message, "error");
      }
    },
    prepareFormValuesForSave() {
      const tag = {
        ...this.formValues,
      };
      return tag;
    },
    onSubmitClick() {
      this.validateForm();
      if (Object.keys(this.formErrors).length === 0) {
        this.updateTag();
      }
    },
    updateTag() {
      this.saveTagState = "PENDING";
      return apolloClient
        .mutate({
          mutation: gql`
            mutation updateTag($tag: TagUpdate!) {
              updateTag(tag: $tag) {
                _id
                name
                slug
                description
                color
                metaTitle
                metaDescription
                blog {
                  _id
                  name
                }
              }
            }
          `,
          variables: {
            tag: this.prepareFormValuesForSave(this.tag),
          },
        })
        .then(response => {
          this.saveTagState = "FINISHED_OK";
          this.tag = response.data.tag;
        })
        .catch(e => {
          this.saveTagState = "FINISHED_ERROR";
          toast(this, e, "error");
          throw new Error(e);
        });
    },
  },
};
</script>
