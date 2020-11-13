<template>
  <AppPanel class="pt-0">
    <h2 class="text-4xl font-bold">
      {{ $t("views.blogSettings.technicalSettingsForm.title") }}
    </h2>
    <form @submit.prevent="onFormSubmit">
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
      <AppButton
        color="primary-outlined"
        :loading="savingState === 'PENDING'"
        type="submit"
      >
        {{ $t("views.blogSettings.technicalSettingsForm.saveButton") }}
      </AppButton>
    </form>
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

const formId = "technicalSettingsForm";

const initFormValues = blog => {
  // for now we can register only ONE webhook:
  // so let's just use the first webhook found for this blog.
  const webhook = blog && blog.webhooks ? blog.webhooks[0] : {};
  const values = {
    webhookUrl: webhook.url ? webhook.url : "",
    webhookMethod: webhook.method ? webhook.method : "POST",
    webhookHeaders: webhook.headers ? webhook.headers : "",
    webhookBody: webhook.body ? webhook.body : "",
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
    onFormSubmit() {
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
          name: vuexFormGetValue(formId, "webhookUrl"),
          url: vuexFormGetValue(formId, "webhookUrl"),
          method: vuexFormGetValue(formId, "webhookMethod"),
          headers: vuexFormGetValue(formId, "webhookHeaders"),
          body: vuexFormGetValue(formId, "webhookBody"),
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
  },
};
</script>
