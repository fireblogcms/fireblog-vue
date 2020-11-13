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
        <div class="flex">
          <div class="mr-2">
            <AppFieldSelect 
              label="Method"
              :options="[{ value:'POST', label : 'POST' }, { value:'GET', label: 'GET'}]" 
              :value="vuexFormGetValue(formId, 'webhookMethod')"
              @input="vuexFormSetValue(formId, 'webhookMethod', $event)"
            />
          </div>
          <div class="flex-grow">
            <AppFieldText
              label="URL"
              placeholder="https://example.com"
              :value="vuexFormGetValue(formId, 'webhookUrl')" 
              @input="vuexFormSetValue(formId, 'webhookUrl', $event)"
            />
          </div>
        </div>
        <div class="my-4">
          <div 
            class="font-bold text-primary cursor-pointer" 
            v-if="showAdvancedSettings === false"
            @click="showAdvancedSettings = true"
          >
            Show advanced settings <span class="">▼</span>
          </div>
          <div 
            class="font-bold text-primary cursor-pointer" 
            v-if="showAdvancedSettings === true"
            @click="showAdvancedSettings = false"
          >
            Hide advanced settings <span class="">▲</span>
          </div>
        </div>
        <div v-show="showAdvancedSettings">
          <AppTextarea
            label="Headers (JSON Format)"
            :value="vuexFormGetValue(formId, 'staticBuildRequestHeaders')"
            @input="vuexFormSetValue(formId, 'staticBuildRequestHeaders', $event)"
            maxlength="250"
            placeholder="{}"
          />
          <AppTextarea
            label="Body"
            :value="vuexFormGetValue(formId, 'staticBuildRequestBody')"
            @input="vuexFormSetValue(formId, 'staticBuildRequestBody', $event)"
            maxlength="250"
            placeholder='{"Authorization": "token abcdefghijk"}'
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
const initialFormValues = {
  webhookUrl: "",
  webhookMethod: "POST",
  webhookBody:"",
  webhookHeaders:"{}",
};

export default {
  components: {
    AppButton,
    AppPanel,
    AppTextarea,
    AppFieldText,
    AppFieldSelect
  },
  props: {
    blog: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      showAdvancedSettings: false,
      savingState: REQUEST_STATE.NOT_STARTED,
    };
  },
  created() {
    this.formId = formId;
    this.vuexFormSetValue = vuexFormSetValue;
    this.vuexFormGetValue = vuexFormGetValue;
    this.vuexFormGetError = vuexFormGetError;

    vuexFormInit(formId, {
      initialValues: {
        webhookUrl: this.blog.webhooks
          ? this.blog.webhooks.map(v => v.url).join(",")
          : initialFormValues.webhooks,
      },
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
      const webhooks = [];
      const webhooksFieldValue = vuexFormGetValue(
        formId,
        "webhookUrl"
      );
      if (webhooksFieldValue.trim()) {
        let webhookUrlArray = webhooksFieldValue.split(",");
        //remove extra spaces
        webhookUrlArray = webhookUrlArray.map(webhook =>
          webhook.trim()
        );
        webhookUrlArray.forEach(webhook => {
          webhooks.push({
            name: webhook,
            url: webhook,
            onEvents: ["global:staticBuildNeeded"],
          });
        });
      }
      return webhooks;
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
