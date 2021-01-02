<template>
  <div>
    <AppFieldText
      label="name"
      v-model="formValues.name"
      :error="formErrors.name"
    />
    <!-- SLUG FIELD -->
    <SlugField
      class="mt-4"
      :value="formValues.slug"
      :error="formErrors.slug"
      :showToggleLockButton="true"
      :locked="slugIsLocked"
      @onSlugChange="onSlugChange"
      @onUnlock="slugIsLocked = false"
      @onLock="slugIsLocked = true"
    />
    <AppTextarea
      label="description"
      v-model="formValues.description"
      class="mt-5"
      maxlength="250"
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
      @onUploaded="onUploaded"
    />
    <div class="flex justify-end mt-10">
      <AppButton @click="onBackClick">Back</AppButton>
      <AppButton
        @click="onSubmitClick"
        class="ml-5"
        color="primary"
        :loading="saveTagState === 'PENDING'"
      >
        {{ operation === "UPDATE" ? "Save" : "Create" }}
      </AppButton>
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
import SlugField from "@/ui-kit/SlugField";

/**
 * @todo
 * - create a real slug field, with slug generation on server side
 * - check if upload image is working
 */

function initFormValues({ tag, blogId }) {
  const form = {
    _id: (tag && tag._id) || "",
    blog: blogId,
    name: (tag && tag.name) || "",
    color: (tag && tag.color) || "",
    image: (tag && tag.image) || "",
    description: (tag && tag.description) || "",
    slug: (tag && tag.slug) || "",
    metaTitle: (tag && tag.metaTitle) || "",
    metaDescription: (tag && tag.metaDescription) || "",
  };
  console.log("form", form);
  return form;
}

export default {
  components: {
    AppFieldText,
    AppTextarea,
    AppButton,
    AppFieldColor,
    S3ImageUpload,
    SlugField,
  },
  props: {
    // CREATE or UPDATE
    operation: {
      type: String,
      required: true,
    },
    blogId: {
      type: String,
      required: true,
    },
    tag: {
      type: [Object, null],
    },
  },
  data() {
    return {
      formValues: initFormValues({ tag: this.tag, blogId: this.blogId }),
      formErrors: {},
      saveTagState: "NOT_STARTED",
      slugIsLocked: this.operation === "UPDATE",
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
    onUploaded(value) {
      this.formValues.image = value;
    },
    validateForm() {
      this.formErrors = {};
      if (!this.formValues.name.trim()) {
        const message = "Field name is required";
        this.formErrors.name = message;
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
      if (this.operation === "CREATE") {
        delete tag._id;
      }
      return tag;
    },
    async onSubmitClick() {
      this.validateForm();
      if (Object.keys(this.formErrors).length === 0) {
        if (this.operation === "UPDATE") {
          await this.updateTag();
          this.$router.push({
            name: "tagList",
            params: {
              blogId: this.$route.params.blogId,
              blogSetId: this.$route.params.blogSetId,
            },
          });
        }
        if (this.operation === "CREATE") {
          await this.createTag();
          this.$router.push({
            name: "tagList",
            params: {
              blogId: this.$route.params.blogId,
              blogSetId: this.$route.params.blogSetId,
            },
          });
        }
      }
    },
    createTag() {
      this.saveTagState = "PENDING";
      return apolloClient
        .mutate({
          mutation: gql`
            mutation createTag($tag: TagCreate!) {
              createTag(tag: $tag) {
                _id
                name
                slug
                description
                color
                metaTitle
                metaDescription
                image
              }
            }
          `,
          variables: {
            tag: this.prepareFormValuesForSave(),
          },
        })
        .then(response => {
          this.saveTagState = "FINISHED_OK";
          this.$emit("createdTag", response.data.createTag);
          return response;
        })
        .catch(e => {
          this.saveTagState = "FINISHED_ERROR";
          toast(this, e, "error");
          throw new Error(e);
        });
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
                image
              }
            }
          `,
          variables: {
            tag: this.prepareFormValuesForSave(),
          },
        })
        .then(response => {
          this.saveTagState = "FINISHED_OK";
          this.$emit("updatedTag", response.data.updateTag);
          return response;
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
