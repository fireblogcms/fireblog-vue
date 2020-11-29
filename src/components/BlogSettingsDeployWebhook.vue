<template>
  <AppPanel>
    <h2 class="text-xl md:text-2xl font-bold">
      {{ $t("views.blogSettings.deployWebhookForm.title") }}
    </h2>

    <div class="mt-6 mb-10">
      <div>
        <AppFieldText
          label="URL"
          :help="
            $t('views.blogSettings.deployWebhookForm.fields.webhooks.help')
          "
          placeholder="https://example.com"
          :value="vuexFormGetValue(formId, 'webhookUrl')"
          @input="vuexFormSetValue(formId, 'webhookUrl', $event)"
          required
        />
      </div>
      <details>
        <summary
          class="outline-none cursor-pointer mt-6 text-primary font-bold"
        >
          Show webhook advanced settings
        </summary>
        <div class="mt-6">
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
            class="mb-6 webhook-headers"
            label="Headers (JSON Format)"
            :value="vuexFormGetValue(formId, 'webhookHeaders')"
            @input="onHeadersInput"
            maxlength="250"
            placeholder='{"Authorization": "token abcdefghijklmnopqrstuvwxyz"}'
            :error="webhookHeadersJSONError"
          />
          <AppTextarea
            label="Body"
            :value="vuexFormGetValue(formId, 'webhookBody')"
            @input="vuexFormSetValue(formId, 'webhookBody', $event)"
            maxlength="250"
            placeholder=""
          />
          <div class="mt-6">
            <span class="font-bold">Curl preview</span>
            <div
              class="bg-black text-white p-6 rounded font-mono"
              v-html="curlPreview"
            />
          </div>
        </div>
      </details>
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
        {{ $t("views.blogSettings.deployWebhookForm.saveButton") }}
      </AppButton>

      <div class="mt-6" v-if="triggerWebhookResponse">
        <span
          v-if="
            triggerWebhookResponse.status >= 200 &&
              triggerWebhookResponse.status < 300
          "
          class="text-green-600"
        >
          <details>
            <summary>
              Deploy webhook: status
              {{ triggerWebhookResponse.status }} OK
            </summary>
            <div class="py-6">
              {{
                triggerWebhookResponse.body
                  ? triggerWebhookResponse.body
                  : "Response body is empty"
              }}
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

const formId = "deployWebhookForm";

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
      webhookHeadersJSONError: null,
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
  computed: {
    curlPreview() {
      let preview = [];

      // add url
      preview.push("curl " + vuexFormGetValue(formId, "webhookUrl"));
      // add method
      if (vuexFormGetValue(formId, "webhookMethod") === "POST") {
        preview.push("-X " + vuexFormGetValue(formId, "webhookMethod"));
      }
      // add headers, if any valid headers are present.
      if (
        vuexFormGetValue(formId, "webhookHeaders").trim().length > 0 &&
        this.headersJsonIsValid()
      ) {
        const headers = JSON.parse(vuexFormGetValue(formId, "webhookHeaders"));
        for (const header in headers) {
          preview.push(`-H "${header}: ${headers[header]}"`);
        }
      }

      // add body, if any
      if (vuexFormGetValue(formId, "webhookBody").trim().length > 0) {
        preview.push(`-d '${vuexFormGetValue(formId, "webhookBody")}'`);
      }

      if (false) {
        preview.push("-X " + vuexFormGetValue(formId, "webhookMethod"));
      }

      //return preview.join(" \\ <br />");
      return preview.join(" ");
    },
  },
  methods: {
    onHeadersInput(value) {
      vuexFormSetValue(formId, "webhookHeaders", value);
      this.headersJsonIsValid();
    },
    validateForm() {
      let isValid = true;
      if (!this.headersJsonIsValid()) {
        toast(this, `Headers error: ${this.webhookHeadersJSONError}`, "error");
        isValid = false;
      }
      if (!vuexFormGetValue(formId, "webhookUrl").startsWith("https://")) {
        toast(this, `Webhook url must begin with https://`, "error");
        isValid = false;
      }
      return isValid;
    },
    onSave() {
      if (!this.validateForm()) {
        return;
      }
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
            this.$t("views.blogSettings.deployWebhookForm.notifications.saved"),
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
      if (!this.validateForm()) {
        return;
      }
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
          this.triggerWebhookResponse = result.data.testDeployWebhook;
          return result.data.testDeployWebhook;
        })
        .catch(error => {
          toast(this, error, "error");
          this.triggerWebhookState = REQUEST_STATE.FINISHED_ERROR;
          throw new Error(error);
        });
    },
    headersJsonIsValid: function() {
      // reset error
      this.webhookHeadersJSONError = "";
      if (vuexFormGetValue(formId, "webhookHeaders").trim().length === 0) {
        return true;
      }
      try {
        // try to parse
        JSON.parse(vuexFormGetValue(formId, "webhookHeaders"));
      } catch (e) {
        this.webhookHeadersJSONError = JSON.stringify(e.message);
        return false;
      }
      return true;
    },
  },
};
</script>
