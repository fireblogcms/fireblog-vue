<template>
  <AppPanel style="margin-top:40px;margin-bottom:40px;padding:40px;" class="container is-small">
    <h2 class="title is-2">{{ $t("views.blogSettings.technicalSettingsForm.title") }}</h2>
    <form @submit.prevent="onFormSubmit">
      <!--
      <div class="field">
        <label class="label">
          {{
          $t("views.blogSettings.technicalSettingsForm.fields.url.label")
          }}
        </label>
        
        <div class="control">
          <input
            :value="formGetValue(formId, 'url')"
            @input="formSetValue(formId, 'url', $event.target.value)"
            :class="{'is-danger': formGetError(formId, 'url')}"
            class="input is-large"
            type="text"
            maxlength="100"
          />
        </div>
        <p
          class="help is-danger"
          v-if="formGetError(formId, 'url')"
        >{{ formGetError(formId, 'url')}}</p>
      </div>
      -->
      <div class="field">
        <div class="label-wrapper">
          <label
            class="label"
          >{{$t("views.blogSettings.technicalSettingsForm.fields.webhooks.label") }}</label>
          <p
            class="description"
          >{{$t("views.blogSettings.technicalSettingsForm.fields.webhooks.help")}}</p>
        </div>
        <textarea
          :value="formGetValue(formId,'staticBuildWebhooks')"
          @input="formSetValue(formId, 'staticBuildWebhooks', $event.target.value)"
          class="textarea"
          placeholder="e.g. Hello world"
        ></textarea>
      </div>
      <div>
        <button
          style="margin-top:20px;"
          class="button is-outlined is-primary is-large"
          :class="{'is-loading': savingState === 'PENDING'}"
          :disabled="savingState === 'PENDING'"
          type="submit"
        >{{ $t("views.blogSettings.technicalSettingsForm.saveButton") }}</button>
      </div>
    </form>
  </AppPanel>
</template>

<script>
import {
  formInit,
  formSetValue,
  formSetError,
  formGetValue,
  formGetError,
  formGetErrors,
  formResetErrors
} from "../utils/vuexForm";
import { REQUEST_STATE, appNotification } from "../utils/helpers";
import AppPanel from "../components/AppPanel";
import apolloClient from "../utils/apolloClient";
import { updateBlogMutation } from "../utils/queries";

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
    this.formSetValue = formSetValue;
    this.formGetValue = formGetValue;
    this.formGetError = formGetError;

    formInit(formId, {
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
        url: formGetValue(formId, "url")
      };
      this.savingState = REQUEST_STATE.PENDING;
      this.updateBlog(update)
        .then(updatedBlog => {
          this.savingState = REQUEST_STATE.FINISHED_OK;
          appNotification(
            this.$t(
              "views.blogSettings.technicalSettingsForm.notifications.saved"
            ),
            "info",
            { persistAfterRouteChange: true }
          );
        })
        .catch(e => {
          appNotification(e, "error");
          this.savingState = REQUEST_STATE.FINISHED_ERROR;
        });
    },
    prepareWebhooksValuesForSave() {
      const webhooks = [];
      const webhooksFieldValue = formGetValue(formId, "staticBuildWebhooks");
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
          await apolloClient.resetStore();
          return result.data.updateBlog;
        })
        .catch(error => {
          appNotification(error, "error");
          throw new Error(error);
        });
    }
  }
};
</script>