<template>
  <AppPanel>
    <h2 class="text-4xl font-bold">
      {{ $t("views.blogSettings.teamSettingsForm.title") }}
    </h2>

    <div class="my-6">
      <div class="flex justify-between">
        <div>
          <div>
            <label class="text-md font-bold">
              mail
            </label>
          </div>
          <AppFieldText
            :value="vuexFormGetValue(formId, 'teamEmailInvitation')"
            @input="vuexFormSetValue(formId, 'teamEmailInvitation')"
            :error="vuexFormGetError(formId, 'teamEmailInvitation')"
            maxlength="250"
          />
        </div>
        <div>
          <div>
            <label class="text-md font-bold">
              rôle
            </label>
          </div>
          <select>
            <option> redactor </option>
            <option> administrator </option>
            <option> technician </option>
          </select>
        </div>
        <div>
          <AppButton
            @click="onInviteButtonClick"
            type="submit"
            color="primary-outlined"
            :loading="savingState === 'PENDING'"
            :disabled="uploadBlogImageState === 'PENDING'"
          >
            {{ $t("views.blogSettings.teamSettingsForm.invite") }}
          </AppButton>
        </div>
      </div>
    </div>
  </AppPanel>
</template>

<script>
import AppButton from "@/ui-kit/AppButton";
import AppFieldText from "@/ui-kit/AppFieldText";
import AppPanel from "@/ui-kit/AppPanel";
import AppTextarea from "@/ui-kit/AppTextarea";
import { getBlog, REQUEST_STATE, toast } from "@/utils/helpers";
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
  },
  methods: {
    validateForm() {
      vuexFormResetErrors(formId);
      if (!vuexFormGetValue(formId, "name").trim()) {
        let message = this.$t(
          "views.blogSettings.generalSettingsForm.fields.name.errors.required"
        );
        vuexFormSetError(formId, "name", message);
      }
    },
    onInviteButtonClick() {
      alert("ok");
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
    },
  },
};
</script>
