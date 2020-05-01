<template>
  <AppPanel class="pt-0">
    <h2 class="title is-2">
      {{ $t("views.blogSettings.technicalSettingsForm.title") }}
    </h2>
    <form @submit.prevent="onFormSubmit">
      <div class="field">
        <div class="label-wrapper">
          <label class="label">{{
            $t("views.blogSettings.technicalSettingsForm.fields.webhooks.label")
          }}</label>
          <p class="help">
            {{
              $t(
                "views.blogSettings.technicalSettingsForm.fields.webhooks.help"
              )
            }}
          </p>
        </div>
        <textarea
          :value="vuexFormGetValue(formId, 'staticBuildWebhooks')"
          @input="
            vuexFormSetValue(formId, 'staticBuildWebhooks', $event.target.value)
          "
          class="textarea"
          placeholder="e.g. Hello world"
        ></textarea>
      </div>
      <div>
        <button
          style="margin-top:20px;"
          class="button is-outlined is-primary is-large"
          :class="{ 'is-loading': savingState === 'PENDING' }"
          :disabled="savingState === 'PENDING'"
          type="submit"
        >
          {{ $t("views.blogSettings.technicalSettingsForm.saveButton") }}
        </button>
      </div>
    </form>
  </AppPanel>
</template>

<script>
import AppPanel from "@/ui-kit/AppPanel";
import {
  vuexFormInit,
  vuexFormSetValue,
  vuexFormSetError,
  vuexFormGetValue,
  vuexFormGetError,
  vuexFormGetErrors,
  vuexFormResetErrors
} from "@/utils/vuexForm";
import { REQUEST_STATE, toast } from "@/utils/helpers";
import apolloClient from "@/utils/apolloClient";
import { updateBlogMutation } from "@/utils/queries";

const formId = "technicalSettingsForm";
const initialFormValues = {
  staticBuildWebhooks: [],
  url: ""
};

export default {
  components: {
    AppPanel
  },
  props: {
    blog: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      savingState: REQUEST_STATE.NOT_STARTED
    };
  },
  created() {
    this.formId = formId;
    this.vuexFormSetValue = vuexFormSetValue;
    this.vuexFormGetValue = vuexFormGetValue;
    this.vuexFormGetError = vuexFormGetError;

    vuexFormInit(formId, {
      initialValues: {
        url: this.blog.url ? this.blog.url : initialFormValues.url,
        staticBuildWebhooks: this.blog.webhooks
          ? this.blog.webhooks.map(v => v.url).join(",")
          : initialFormValues.webhooks
      }
    });
  },
  methods: {
    onFormSubmit() {
      const webhooks = this.prepareWebhooksValuesForSave();
      const update = {
        _id: this.$route.params.blogId,
        webhooks,
        url: vuexFormGetValue(formId, "url")
      };
      this.savingState = REQUEST_STATE.PENDING;
      this.updateBlog(update)
        .then(updatedBlog => {
          this.savingState = REQUEST_STATE.FINISHED_OK;
          toast(this, this.$t("views.blogSettings.technicalSettingsForm.notifications.saved"), "success");
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
            onEvents: ["global:staticBuildNeeded"]
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
    }
  }
};
</script>
