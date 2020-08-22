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
            :value="vuexFormGetValue(formId, 'mail')"
            @input="vuexFormSetValue(formId, 'mail', $event)"
            :error="vuexFormGetError(formId, 'mail')"
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

const formId = "blogSettingsTeam";

function initialFormValues(blog) {
  const values = {
    mail: "",
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
    validateForm() {},
    onInviteButtonClick() {
      // First we want to search user identifies for this mail.
      // we MAY HAVE SEVERAL identifies for a single mail:
      //
      // For example a user might have registered with github AND google,
      // and have used the same mail for both. But we consider for now
      // those are two distinct identities.

      apolloClient
        .query({
          variables: {
            blogId: this.$route.params.blogId,
            mail: vuexFormGetValue(formId, "mail"),
          },
          query: gql`
            query blogTeamSearchUserByMail($blogId: ID!, $mail: String!) {
              blogTeamSearchUserByMail(blogId: $blogId, mail: $mail) {
                name
                provider
              }
            }
          `,
        })
        .then(r => {
          console.log("r", r);
        })
        .catch(error => {
          toast(this, error, "error");
        });
    },
  },
};
</script>
