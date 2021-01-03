<template>
  <div>
    <AppFieldText
      label="name"
      v-model="formValues.name"
      :error="formErrors.name"
      @change="onNameChange"
    />

    <AppTextarea
      label="description"
      v-model="formValues.description"
      class="mt-5"
      maxlength="250"
    />
    <AppFieldColor label="Color" v-model="formValues.color" class="mt-5" />
    <div class="font-bold mt-5">Image</div>
    <S3ImageUpload
      label="Image"
      :blogId="$route.params.blogId"
      :initialImage="formValues.image"
      @onUploaded="onUploaded"
    />

    <h3 class="text-2xl font-bold flex items-center mt-16 mb-8">
      <div>
        <img width="30" src="/images/icon-seo.png" class="inline mr-5" />
      </div>
      <div class="text-xl md:text-2xl">
        Optimisations pour les moteurs de recherche
      </div>
    </h3>
    <!-- SLUG FIELD -->
    <SlugField
      :loading="generateSlugState === 'PENDING'"
      class="mt-4"
      :value="formValues.slug"
      :error="formErrors.slug"
      :help="slugHelp"
      :showToggleLockButton="true"
      :locked="slugIsLocked"
      @inputDebounced="onSlugChange"
      @onUnlock="slugIsLocked = false"
      @onLock="slugIsLocked = true"
    />

    <AppFieldText
      label="SEO meta title"
      v-model="formValues.metaTitle"
      class="mt-5"
    />
    <AppTextarea
      maxlength="250"
      label="SEO meta description"
      v-model="formValues.metaDescription"
      class="mt-5"
    />
    <p class="mb-4 font-bold mt-10">
      {{ $t("views.postForm.advancedSettingsModal.previewGoogle") }}
    </p>
    <div class="p-6 bg-white shadow-around rounded-lg">
      <PreviewGoogleResult
        :title="previewGoogleValues().title"
        :description="previewGoogleValues().description"
        :url="`https://example.com/tag/${formValues.slug}`"
      />
    </div>

    <div class="flex justify-end mt-10">
      <AppButton @click="onBackClick">Back</AppButton>
      <AppButton
        :disabled="saveTagState === 'PENDING'"
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
import { toast, generateTagSlugFromServer } from "@/utils/helpers";
import apolloClient from "@/utils/apolloClient";
import gql from "graphql-tag";
import SlugField from "@/ui-kit/SlugField";
import PreviewGoogleResult from "./PreviewGoogleResult";

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
    PreviewGoogleResult,
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
      slugError: null,
      generateSlugState: "NOT_STARTED",
    };
  },
  computed: {
    slugHelp() {
      return this.$t("components.slugFieldTag.help", {
        exampleUrl: `https://example.com/tag/<mark class="font-bold bg-indigo-200 text-current">${this.slug}</mark>`,
      });
    },
  },
  methods: {
    async onNameChange(name) {
      if (
        this.operation === "CREATE" &&
        this.formValues.slug.trim().length === 0
      ) {
        this.generateTagSlug(name);
      }
    },
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
    generateTagSlug(value) {
      if (value.trim().length === 0) {
        return;
      }
      this.generateSlugState = "PENDING";
      return generateTagSlugFromServer({
        blogId: this.$route.params.blogId,
        source: value,
      })
        .then(response => {
          this.generateSlugState = "FINISHED_OK";
          const slug = response.slug;
          this.formValues.slug = slug;
          if (
            response.existingTag &&
            response.existingTag._id !== this.$route.params.tagId
          ) {
            this.formErrors = {
              ...this.formErrors,
              slug: `This slug is already used by tag: ${response.existingTag.name}`,
            };
          } else {
            this.$delete(this.formErrors, "slug");
          }
          return response;
        })
        .catch(e => {
          throw new Error(e);
          toast(this, message, "error");
          this.generateSlugState = "FINISHED_ERROR";
        });
    },
    onSlugChange(value) {
      this.formValues.slug = value;
      this.generateTagSlug(value);
    },
    async validateForm() {
      this.formErrors = {};
      // name is required
      if (!this.formValues.name.trim()) {
        const message = "Field name is required";
        this.formErrors.name = message;
        toast(this, message, "error");
      }
      // slug is required
      if (!this.formValues.slug.trim()) {
        const message = "Field slug is required";
        this.formErrors.slug = message;
        toast(this, message, "error");
      }
      // validate slug is uniq for this blog
      this.generateSlugState = "PENDING";
      try {
        const response = await generateTagSlugFromServer({
          blogId: this.$route.params.blogId,
          source: this.formValues.slug,
        });
        if (
          response.existingTag &&
          response.existingTag._id !== this.$route.params.tagId
        ) {
          this.formErrors = {
            ...this.formErrors,
            slug: `This slug is already used by tag: ${response.existingTag.name}`,
          };
        } else {
          this.$delete(this.formErrors, "slug");
        }
      } catch (e) {
        throw new Error(e);
        toast(this, message, "error");
        this.generateSlugState = "FINISHED_ERROR";
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
      await this.validateForm();
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
    previewGoogleValues() {
      let title = this.formValues.name;
      let description = this.formValues.description;
      if (this.formValues.metaTitle.trim()) {
        title = this.formValues.metaTitle.trim();
      }
      if (this.formValues.metaDescription.trim()) {
        description = this.formValues.metaDescription.trim();
      }
      return {
        title,
        description,
      };
    },
  },
};
</script>
