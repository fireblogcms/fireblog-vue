<template>
  <AppPanel class="pt-0">
    <h2 class="text-4xl font-bold">
      {{ $t("views.blogSettings.technicalSettingsForm.title") }}
    </h2>

    <div class="mt-6 mb-10">
      <label class="text-md font-bold">
        {{
          $t("views.blogSettings.technicalSettingsForm.fields.webhooks.label")
        }}
      </label>
      <p class="mb-4 text-sm">
        {{
          $t("views.blogSettings.technicalSettingsForm.fields.webhooks.help")
        }}
      </p>
      <div>
        <AppFieldText
          label="URL"
          placeholder="https://example.com"
          :value="vuexFormGetValue(formId, 'webhookUrl')"
          @input="vuexFormSetValue(formId, 'webhookUrl', $event)"
          required
        />
      </div>
      <div class="my-4">
        <div
          class="font-bold text-primary cursor-pointer"
          v-if="showWebhookAdvancedSettings === false"
          @click="showWebhookAdvancedSettings = true"
        >
          Show webhook advanced settings <span class="">▼</span>
        </div>
        <div
          class="font-bold text-primary cursor-pointer"
          v-if="showWebhookAdvancedSettings === true"
          @click="showWebhookAdvancedSettings = false"
        >
          Hide advanced settings <span class="">▲</span>
        </div>
      </div>
      <div v-show="showWebhookAdvancedSettings">
        <AppFieldSelect
          class="mb-6"
          label="Method"
          :options="[
            { value: 'POST', label: 'POST' },
            { value: 'GET', label: 'GET' },
          ]"
          :value="vuexFormGetValue(formId, 'webhookMethod')"
          @change="vuexFormSetValue(formId, 'webhookMethod', $event)"
        />
        <AppTextarea
          class="mb-6"
          label="Headers (JSON Format)"
          :value="vuexFormGetValue(formId, 'webhookHeaders')"
          @input="vuexFormSetValue(formId, 'webhookHeaders', $event)"
          maxlength="250"
          placeholder="{}"
        />
        <AppTextarea
          label="Body"
          :value="vuexFormGetValue(formId, 'webhookBody')"
          @input="vuexFormSetValue(formId, 'webhookBody', $event)"
          maxlength="250"
          placeholder=""
        />
      </div>
    </div>
    <div>
      <AppButton
        class="mr-4"
        :loading="triggerWebhookState === 'PENDING'"
        @click="onTriggerWebhookClick"
      >
        Trigger webhook
      </AppButton>

      <AppButton
        color="primary-outlined"
        :loading="savingState === 'PENDING'"
        @click="onSave"
      >
        {{ $t("views.blogSettings.technicalSettingsForm.saveButton") }}
      </AppButton>

      <div class="mt-6" v-if="triggerWebhookResponse">
        <span
          v-if="triggerWebhookResponse.status === 200"
          class="text-green-600"
        >
          <details>
            <summary>
              Deploy webhook: status
              {{ triggerWebhookResponse.status }} OK
            </summary>
            <div class="py-6">
              {{ triggerWebhookResponse.body }}
            </div>
          </details>
        </span>
        <span v-if="triggerWebhookResponse.error" class="text-red-600">
          <details>
            <summary>
              {{ triggerWebhookResponse.status }}:
              {{ triggerWebhookResponse.error }}
            </summary>
            <div class="py-6">
              {{ triggerWebhookResponse.body }}
            </div>
          </details>
        </span>
      </div>
    </div>
  </AppPanel>
</template>

<script>
import AppButton from "@/ui-kit/AppButton";
import AppPanel from "@/ui-kit/AppPanel";
import AppTextarea from "@/ui-kit/AppTextarea";
import AppFieldText from "@/ui-kit/AppFieldText";
import AppFieldSelect from "@/ui-kit/AppFieldSelect";
import {
  vuexFormInit,
  vuexFormSetValue,
  vuexFormSetError,
  vuexFormGetValue,
  vuexFormGetError,
  vuexFormGetErrors,
  vuexFormResetErrors,
} from "@/utils/vuexForm";
import { REQUEST_STATE, toast } from "@/utils/helpers";
import apolloClient from "@/utils/apolloClient";
import { updateBlogMutation } from "@/utils/queries";
import gql from "graphql-tag";

const formId = "technicalSettingsForm";

const initFormValues = blog => {
  let existingWebhook = {};
  if (blog && blog.webhooks && blog.webhooks.length > 0) {
    existingWebhook = blog.webhooks[0];
  }
  const values = {
    webhookUrl: existingWebhook.url ? existingWebhook.url : "",
    webhookMethod: existingWebhook.method ? existingWebhook.method : "POST",
    webhookHeaders: existingWebhook.headers ? existingWebhook.headers : "",
    webhookBody: existingWebhook.body ? existingWebhook.body : "",
  };
  return values;
};

export default {
  components: {
    AppButton,
    AppPanel,
    AppTextarea,
    AppFieldText,
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
      showWebhookAdvancedSettings: false,
      savingState: REQUEST_STATE.NOT_STARTED,
      triggerWebhookState: REQUEST_STATE.NOT_STARTED,
      triggerWebhookResponse: null,
    };
  },
  created() {
    this.formId = formId;
    this.vuexFormSetValue = vuexFormSetValue;
    this.vuexFormGetValue = vuexFormGetValue;
    this.vuexFormGetError = vuexFormGetError;
    vuexFormInit(formId, {
      initialValues: initFormValues(this.blog),
    });
  },
  methods: {
    onSave() {
      const webhooks = this.prepareWebhooksValuesForSave();
      const update = {
        _id: this.$route.params.blogId,
        webhooks,
        url: vuexFormGetValue(formId, "url"),
      };
      this.savingState = REQUEST_STATE.PENDING;
      this.updateBlog(update)
        .then(updatedBlog => {
          this.savingState = REQUEST_STATE.FINISHED_OK;
          toast(
            this,
            this.$t(
              "views.blogSettings.technicalSettingsForm.notifications.saved"
            ),
            "success"
          );
        })
        .catch(e => {
          toast(this, e, "error");
          this.savingState = REQUEST_STATE.FINISHED_ERROR;
        });
    },
    prepareWebhooksValuesForSave() {
      // webooks is an array in our database, even if we allow only
      // one webhook to be saved for now.
      const wehbooks = [
        {
          name: vuexFormGetValue(formId, "webhookUrl").trim(),
          url: vuexFormGetValue(formId, "webhookUrl").trim(),
          method: vuexFormGetValue(formId, "webhookMethod").trim(),
          headers: vuexFormGetValue(formId, "webhookHeaders").trim(),
          body: vuexFormGetValue(formId, "webhookBody").trim(),
          onEvents: ["global:staticBuildNeeded"],
        },
      ];
      return wehbooks;
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
    onTriggerWebhookClick() {
      this.triggerWebhookResponse = null;
      this.triggerWebhookState = REQUEST_STATE.PENDING;
      const webhook = {
        url: vuexFormGetValue(formId, "webhookUrl").trim(),
        method: vuexFormGetValue(formId, "webhookMethod").trim(),
        headers: vuexFormGetValue(formId, "webhookHeaders").trim(),
        body: vuexFormGetValue(formId, "webhookBody").trim(),
      };
      return apolloClient
        .query({
          query: gql`
            query testDeployWebhook(
              $url: String!
              $method: String!
              $headers: String
              $body: String
            ) {
              testDeployWebhook(
                url: $url
                method: $method
                headers: $headers
                body: $body
              ) {
                error
                status
                body
              }
            }
          `,
          variables: {
            url: webhook.url,
            method: webhook.method,
            headers: webhook.headers,
            body: webhook.body,
          },
        })
        .then(async result => {
          this.triggerWebhookState = REQUEST_STATE.FINISHED_OK;
          console.log("result", result);
          this.triggerWebhookResponse = result.data.testDeployWebhook;
          return result.data.testDeployWebhook;
        })
        .catch(error => {
          toast(this, error, "error");
          this.triggerWebhookState = REQUEST_STATE.FINISHED_ERROR;
          throw new Error(error);
        });
    },
  },
};
</script>
