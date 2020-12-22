<template>
  <AppPanel>
    <h2 class="text-xl md:text-2xl font-bold uppercase">
      {{ $t("views.blogSettings.generalSettingsForm.title") }}
    </h2>
    <form @submit.prevent="onFormSubmit">
      <div class="my-6">
        <p class="mb-2">
          <label class="text-md font-bold">
            {{ $t("views.blogSettings.generalSettingsForm.fields.name.label") }}
          </label>
        </p>
        <AppFieldText
          :value="vuexFormGetValue(formId, 'name')"
          @input="vuexFormSetValue(formId, 'name', $event)"
          :error="vuexFormGetError(formId, 'name')"
          maxlength="100"
        />
      </div>

      <div class="mb-6">
        <label class="text-md font-bold">
          {{
            $t(
              "views.blogSettings.generalSettingsForm.fields.description.label"
            )
          }}
        </label>
        <!--
        <p class="mb-4 text-sm">
          {{
            $t("views.blogSettings.generalSettingsForm.fields.description.help")
          }}
        </p>
        -->
        <AppTextarea
          :value="vuexFormGetValue(formId, 'description')"
          @input="vuexFormSetValue(formId, 'description', $event)"
          maxlength="250"
        />
      </div>

      <div class="mb-10">
        <label class="text-md font-bold">
          {{ $t("views.blogSettings.generalSettingsForm.fields.image.label") }}
        </label>
        <!--
        <p class="mb-4 text-sm">
          {{ $t("views.blogSettings.generalSettingsForm.fields.image.help") }}
        </p>
        -->
        <S3ImageUpload
          :blogId="$route.params.blogId"
          @onUploadingStateChange="onUploadingStateChange"
          :initialImage="vuexFormGetValue(formId, 'image')"
          @onUploaded="onUploaded"
        />
      </div>

      <div>
        <label class="text-2xl font-bold">{{
          $t("views.blogCreate.fields.ambiance.label")
        }}</label>
        <AppFieldSelect
          class="mb-6"
          :options="wallpapersSelectOptions"
          :value="vuexFormGetValue(formId, 'wallpaper')"
          @change="onWallPaperChange"
        />
      </div>

      <AppButton
        type="submit"
        color="primary"
        :loading="savingState === 'PENDING'"
        :disabled="uploadBlogImageState === 'PENDING'"
      >
        {{ $t("views.blogSettings.generalSettingsForm.saveButton") }}
      </AppButton>
    </form>
  </AppPanel>
</template>

<script>
import AppButton from "@/ui-kit/AppButton";
import AppFieldText from "@/ui-kit/AppFieldText";
import AppPanel from "@/ui-kit/AppPanel";
import AppTextarea from "@/ui-kit/AppTextarea";
import AppFieldSelect from "@/ui-kit/AppFieldSelect";
import { getBlog, REQUEST_STATE, toast } from "@/utils/helpers";
import { wallpapersSelectOptions } from "@/config.js";
import {
  vuexFormInit,
  vuexFormSetValue,
  vuexFormSetError,
  vuexFormGetValue,
  vuexFormGetError,
  vuexFormGetErrors,
  vuexFormResetErrors,
} from "@/utils/vuexForm";
import apolloClient from "@/utils/apolloClient";
import gql from "graphql-tag";
import S3ImageUpload from "./S3ImageUpload";
import { updateBlogMutation } from "@/utils/queries";

const formId = "blogSettingsGeneral";

function initialFormValues(blog) {
  const values = {
    name: blog.name ? blog.name : "",
    description: blog.description ? blog.description : "",
    image: blog.image ? blog.image.url : null,
    wallpaper: blog.wallpaper ? blog.wallpaper : null,
  };
  return values;
}

export default {
  components: {
    AppButton,
    AppFieldText,
    AppPanel,
    AppTextarea,
    S3ImageUpload,
    AppFieldSelect,
  },
  props: {
    blog: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      savingState: REQUEST_STATE.NOT_STARTED,
      uploadBlogImageState: REQUEST_STATE.NOT_STARTED,
    };
  },
  created() {
    this.formId = formId;
    this.vuexFormSetValue = vuexFormSetValue;
    this.vuexFormGetValue = vuexFormGetValue;
    this.vuexFormGetError = vuexFormGetError;
    vuexFormInit(formId, {
      initialValues: initialFormValues(this.blog),
    });
    this.wallpapersSelectOptions = wallpapersSelectOptions;
  },
  methods: {
    onWallPaperChange(value) {
      if (value === "__NONE__") {
        value = null;
      }
      vuexFormSetValue(formId, "wallpaper", value);
      this.$store.commit("wallpaper", value);
    },
    onUploadingStateChange(state) {
      this.uploadBlogImageState = state;
    },
    onUploaded(fileUrl) {
      vuexFormSetValue(formId, "image", fileUrl);
    },
    validateForm() {
      vuexFormResetErrors(formId);
      if (!vuexFormGetValue(formId, "name").trim()) {
        let message = this.$t(
          "views.blogSettings.generalSettingsForm.fields.name.errors.required"
        );
        vuexFormSetError(formId, "name", message);
      }
    },
    updateBlog(blog) {
      return apolloClient
        .mutate({
          mutation: updateBlogMutation,
          variables: {
            blog,
          },
        })
        .then(async result => {
          return result.data.updateBlog;
        })
        .catch(error => {
          toast(this, error, "error");
          throw new Error(error);
        });
    },
    onFormSubmit() {
      this.validateForm();
      // display form errors if any
      const formErrors = vuexFormGetErrors(formId);
      if (Object.keys(formErrors).length > 0) {
        const message = Object.keys(formErrors)
          .map(key => formErrors[key])
          .join(". ");
        toast(this, message, "error");
        return;
      }

      this.savingState = REQUEST_STATE.PENDING;
      const blog = {
        _id: this.$route.params.blogId,
        name: vuexFormGetValue(formId, "name"),
        description: vuexFormGetValue(formId, "description"),
        image: vuexFormGetValue(formId, "image"),
        wallpaper: vuexFormGetValue(formId, "wallpaper"),
      };
      this.updateBlog(blog)
        .then(updatedBlog => {
          this.savingState = REQUEST_STATE.FINISHED_OK;
          toast(
            this,
            this.$t(
              "views.blogSettings.generalSettingsForm.notifications.saved"
            ),
            "success"
          );
        })
        .catch(e => {
          this.savingState = REQUEST_STATE.FINISHED_ERROR;
        });
    },
  },
};
</script>
