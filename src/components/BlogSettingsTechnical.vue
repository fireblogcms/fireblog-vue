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
        <AppTextarea
          :value="vuexFormGetValue(formId, 'staticBuildWebhooks')"
          @input="vuexFormSetValue(formId, 'staticBuildWebhooks', $event)"
          maxlength="250"
          placeholder="e.g. Hello world"
        />
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
  staticBuildWebhooks: [],
  url: "",
};

export default {
  components: {
    AppButton,
    AppPanel,
    AppTextarea,
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
    };
  },
  created() {
    this.formId = formId;
    this.vuexFormSetValue = vuexFormSetValue;
    this.vuexFormGetValue = vuexFormGetValue;
    this.vuexFormGetError = vuexFormGetError;

    vuexFormInit(formId, {
      initialValues: {
        staticBuildWebhooks: this.blog.webhooks
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
        "staticBuildWebhooks"
      );
      if (webhooksFieldValue.trim()) {
        let staticBuildWebhooksArray = webhooksFieldValue.split(",");
        //remove extra spaces
        staticBuildWebhooksArray = staticBuildWebhooksArray.map(webhook =>
          webhook.trim()
        );
        staticBuildWebhooksArray.forEach(webhook => {
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
