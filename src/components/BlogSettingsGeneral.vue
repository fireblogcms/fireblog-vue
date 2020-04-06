<template>
  <AppPanel
    style="margin-top:40px;margin-bottom:40px;padding:40px;"
    class="container is-small"
  >
    <h2 class="title is-2">
      {{ $t("views.blogSettings.generalSettingsForm.title") }}
    </h2>
    <form @submit.prevent="onFormSubmit">
      <div class="field">
        <div class="label-wrapper">
          <label class="label">
            {{ $t("views.blogSettings.generalSettingsForm.fields.name.label") }}
          </label>
        </div>
        <div class="control is-danger">
          <input
            :value="vuexFormGetValue(formId, 'name')"
            @input="vuexFormSetValue(formId, 'name', $event.target.value)"
            class="input is-large"
            :class="{ 'is-danger': vuexFormGetError(formId, 'name') }"
            type="text"
            maxlength="100"
          />
        </div>
        <p class="help is-danger" v-if="vuexFormGetError(formId, 'name')">
          {{ vuexFormGetError(formId, "name") }}
        </p>
      </div>
      <div class="field">
        <div class="label-wrapper">
          <label class="label">Description (250 caractères maximum)</label>
          <p class="help">
            {{
              $t(
                "views.blogSettings.generalSettingsForm.fields.description.help"
              )
            }}
          </p>
        </div>
        <div class="control">
          <textarea
            class="textarea"
            :value="vuexFormGetValue(formId, 'description')"
            @input="
              vuexFormSetValue(formId, 'description', $event.target.value)
            "
            type="text"
            maxlength="250"
          ></textarea>
        </div>
      </div>

      <div class="field">
        <div class="label-wrapper">
          <label class="label">
            {{
              $t("views.blogSettings.generalSettingsForm.fields.image.label")
            }}
          </label>
          <p class="help">
            {{ $t("views.blogSettings.generalSettingsForm.fields.image.help") }}
          </p>
        </div>
        <S3ImageUpload
          style="max-width:600px;"
          :blogId="$route.params.blogId"
          @onUploadingStateChange="onUploadingStateChange"
          :initialImage="vuexFormGetValue(formId, 'image')"
          @onUploaded="onUploaded"
        />
      </div>
      <div>
        <button
          style="margin-top:20px;"
          class="button is-outlined is-primary is-large"
          :class="{ 'is-loading': savingState === 'PENDING' }"
          :disabled="
            uploadBlogImageState === 'PENDING' || savingState === 'PENDING'
          "
          type="submit"
        >
          {{ $t("views.blogSettings.generalSettingsForm.saveButton") }}
        </button>
      </div>
    </form>
  </AppPanel>
</template>

<script>
import AppPanel from "../components/AppPanel";
import {
  getBlog,
  REQUEST_STATE,
  toast
} from "../utils/helpers";
import {
  vuexFormInit,
  vuexFormSetValue,
  vuexFormSetError,
  vuexFormGetValue,
  vuexFormGetError,
  vuexFormGetErrors,
  vuexFormResetErrors
} from "../utils/vuexForm";
import AppLoader from "../components/AppLoader";
import apolloClient from "../utils/apolloClient";
import gql from "graphql-tag";
import BulmaModal from "./BulmaModal";
import S3ImageUpload from "./S3ImageUpload";
import { updateBlogMutation } from "../utils/queries";

const formId = "blogSettingsGeneral";

const initialFormValues = {
  name: "",
  description: "",
  image: null
};

export default {
  props: {
    blog: {
      type: Object,
      required: true
    }
  },
  components: {
    AppPanel,
    AppPanel,
    S3ImageUpload
  },
  data() {
    return {
      savingState: REQUEST_STATE.NOT_STARTED,
      uploadBlogImageState: REQUEST_STATE.NOT_STARTED
    };
  },
  created() {
    this.formId = formId;
    this.vuexFormSetValue = vuexFormSetValue;
    this.vuexFormGetValue = vuexFormGetValue;
    this.vuexFormGetError = vuexFormGetError;
    vuexFormInit(formId, {
      initialValues: {
        name: this.blog.name ? this.blog.name : "",
        description: this.blog.description ? this.blog.description : "",
        image: this.blog.image ? this.blog.image : null
      }
    });
  },
  methods: {
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
            blog
          }
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
        image: vuexFormGetValue(formId, "image")
      };
      this.updateBlog(blog)
        .then(updatedBlog => {
          this.savingState = REQUEST_STATE.FINISHED_OK;
          toast(this, this.$t("views.blogSettings.generalSettingsForm.notifications.saved"), "success");
        })
        .catch(e => {
          this.savingState = REQUEST_STATE.FINISHED_ERROR;
        });
    }
  }
};
</script>
