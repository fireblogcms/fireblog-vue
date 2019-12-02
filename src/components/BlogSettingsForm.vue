<template>
  <div>
    <pre v-if="false">{{ generalSettingsForm }}</pre>
    <AppLoader v-if="initDataState === 'PENDING'">Loading</AppLoader>

    <AppError v-if="errorMessage">{{ errorMessage }}</AppError>
    <AppMessage v-if="appMessage">{{ appMessage }}</AppMessage>
    <template v-if="initDataState === 'FINISHED_OK'">
      <AppPanel
        style="margin-top:40px;margin-bottom:40px;padding:40px;"
        class="container"
        v-if="initDataState === 'FINISHED_OK'"
      >
        <h2 class="title is-2">{{ $t("views.blogSettings.generalSettingsForm.title") }}</h2>
        <form @submit.prevent="onGeneralSettingsFormSubmit">
          <div class="field">
            <label
              class="label"
            >{{ $t("views.blogSettings.generalSettingsForm.fields.name.label") }}</label>
            <div class="control">
              <input
                v-model="generalSettingsForm.values.current.name"
                class="input is-large"
                type="text"
                maxlength="250"
              />
            </div>
            <p
              class="help is-danger"
              v-if="generalSettingsForm.errors.name"
            >{{ generalSettingsForm.errors.name }}</p>
          </div>
          <div class="field">
            <label class="label">Description</label>
            <div class="control">
              <textarea
                class="textarea is-large"
                v-model="generalSettingsForm.values.current.description"
                type="text"
              ></textarea>
            </div>
          </div>
          <div>
            <button
              style="margin-top:20px;"
              class="button is-outlined is-primary is-large"
              :class="{
              'is-loading': savingGeneralSettingsState === 'PENDING'
            }"
              :disabled="savingGeneralSettingsState === 'PENDING'"
              type="submit"
            >{{ $t("views.blogSettings.generalSettingsForm.saveButton") }}</button>
          </div>
        </form>
      </AppPanel>

      <AppPanel
        style="margin-top:40px;margin-bottom:40px;padding:40px;"
        class="container"
        v-if="initDataState === 'FINISHED_OK'"
      >
        <h2 class="title is-2">{{ $t("views.blogSettings.technicalSettingsForm.title") }}</h2>
        <form @submit.prevent="onTechnicalSettingsFormSubmit">
          <div class="field">
            <label class="label">
              {{
              $t(
              "views.blogSettings.technicalSettingsForm.fields.webhooks.label"
              )
              }}
            </label>
            <textarea
              v-model="technicalSettingsForm.values.current.staticBuildWebhooks"
              class="textarea"
              placeholder="e.g. Hello world"
            ></textarea>
            <p class="help">
              {{
              $t(
              "views.blogSettings.technicalSettingsForm.fields.webhooks.help"
              )
              }}
            </p>
          </div>
          <div>
            <button
              style="margin-top:20px;"
              class="button is-outlined is-primary is-large"
              :class="{
              'is-loading': savingTechnicalSettingsState === 'PENDING'
            }"
              :disabled="savingTechnicalSettingsState === 'PENDING'"
              type="submit"
            >{{ $t("views.blogSettings.technicalSettingsForm.saveButton") }}</button>
          </div>
        </form>
      </AppPanel>

      <AppPanel
        class="container"
        style="margin-top:40px;margin-bottom:40px;padding:40px;border: solid red 1px;background:rgba(255,0,0,0.1)"
      >
        <h2 class="title is-2">{{ $t("views.blogSettings.dangerZone.title") }}</h2>
        <button
          @click="onDeleteBlogClick"
          class="button is-danger is-large"
        >{{$t('views.blogSettings.dangerZone.deleteBlog')}}</button>
      </AppPanel>

      <BulmaModal class="api-modal" v-model="showDeleteBlogModal">
        <template #title>
          Detele
          <em>{{blog.name}}</em>
        </template>
        <template #body>
          <div>
            <div class="field">
              <label class="label">Please type the name of the blog to confirm</label>
              <div class="control">
                <input v-model="deleteBlogConfirmName" class="input is-large" type="text" />
                <p
                  v-if="deleteBlogConfirmError"
                  class="help is-danger"
                >Name does not match the blog's name.</p>
              </div>
            </div>
          </div>
        </template>
        <template #footer>
          <button @click="showDeleteBlogModal = false" class="button is-large">Cancel</button>
          <button
            :class="{'is-loading': deleteBlogState === 'PENDING'}"
            :disabled="deleteBlogState === 'PENDING'"
            @click="onDeleteBlogConfirm"
            class="button is-danger is-large"
          >Delete</button>
        </template>
      </BulmaModal>
    </template>
  </div>
</template>

<script>
import AppPanel from "../components/AppPanel";
import { getBlog, REQUEST_STATE, formInitData } from "../utils/helpers";
import AppLoader from "../components/AppLoader";
import AppError from "../components/AppError";
import AppMessage from "../components/AppMessage";
import apolloClient from "../utils/apolloClient";
import gql from "graphql-tag";
import BulmaModal from "./BulmaModal";
import {
  deleteBlogMutation,
  getMyBlogsQuery,
  getUserQuery
} from "../utils/queries";

const initialGeneralSettingsFormValues = {
  name: "",
  description: ""
};

const initialTechnicalSettingsFormValues = {
  staticBuildWebhooks: []
};

export default {
  components: {
    AppPanel,
    AppLoader,
    AppError,
    AppMessage,
    AppPanel,
    BulmaModal
  },
  data() {
    return {
      blog: null,
      initDataState: REQUEST_STATE.NOT_STARTED,
      savingGeneralSettingsState: REQUEST_STATE.NOT_STARTED,
      savingTechnicalSettingsState: REQUEST_STATE.NOT_STARTED,
      deleteBlogState: REQUEST_STATE.NOT_STARTED,
      showDeleteBlogModal: false,
      deleteBlogConfirmName: "",
      deleteBlogConfirmError: false,
      generalSettingsForm: formInitData({
        initialFormValues: initialGeneralSettingsFormValues
      }),
      technicalSettingsForm: formInitData({
        initialFormValues: initialTechnicalSettingsFormValues
      }),
      errorMessage: null,
      appMessage: null
    };
  },
  created() {
    this.initData();
  },
  methods: {
    validateGeneralSettingsForm() {
      this.generalSettingsForm.errors = {};
      if (!this.generalSettingsForm.values.current.name.trim()) {
        this.generalSettingsForm.errors.name = this.$t(
          "views.blogSettings.generalSettingsForm.fields.name.errors.required"
        );
      }
    },
    updateBlog(blog) {
      return apolloClient
        .mutate({
          mutation: gql`
            mutation updateBlog($blog: UpdateBlogInput!) {
              updateBlog(blog: $blog) {
                name
                description
              }
            }
          `,
          variables: {
            blog
          }
        })
        .then(async result => {
          await apolloClient.resetStore();
          return result.data.updateBlog;
        })
        .catch(error => {
          this.errorMessage = error;
          throw new Error(error);
        });
    },
    initData() {
      this.errorMessage = null;
      this.initDataState = REQUEST_STATE.PENDING;
      getBlog(this.$route.params.blogId)
        .then(blog => {
          this.blog = blog;
          this.initDataState = REQUEST_STATE.FINISHED_OK;
          this.generalSettingsForm = formInitData({
            initialFormValues: {
              ...initialGeneralSettingsFormValues,
              name: blog.name,
              description: blog.description,
              staticBuildWebhooks: blog.webhooks
                ? blog.webhooks.map(webhook => webhook.url).join(",")
                : ""
            }
          });
          this.technicalSettingsForm = formInitData({
            initialFormValues: {
              ...initialTechnicalSettingsFormValues,
              staticBuildWebhooks: blog.webhooks
                ? blog.webhooks.map(webhook => webhook.url).join(",")
                : ""
            }
          });
        })
        .catch(error => {
          this.errorMessage = error;
          this.initDataState = REQUEST_STATE.FINISHED_ERROR;
        });
    },
    onGeneralSettingsFormSubmit() {
      this.errorMessage = null;
      this.validateGeneralSettingsForm();
      if (Object.keys(this.generalSettingsForm.errors).length > 0) {
        this.errorMessage = Object.keys(this.generalSettingsForm.errors)
          .map(key => this.generalSettingsForm.errors[key])
          .join(". ");
        return;
      } else {
        this.savingGeneralSettingsState = REQUEST_STATE.PENDING;
        const blog = {
          _id: this.$route.params.blogId,
          name: this.generalSettingsForm.values.current.name,
          description: this.generalSettingsForm.values.current.description
        };
        this.updateBlog(blog)
          .then(updatedBlog => {
            this.savingGeneralSettingsState = REQUEST_STATE.FINISHED_OK;
            this.appMessage = `"${updatedBlog.name}" general settings have been saved.`;
          })
          .catch(e => {
            this.savingGeneralSettingsState = REQUEST_STATE.FINISHED_ERROR;
          });
      }
    },
    onTechnicalSettingsFormSubmit() {
      const webhooks = this.prepareWebhooksValuesForSave();
      const blog = {
        _id: this.$route.params.blogId,
        webhooks
      };
      this.savingTechnicalSettingsState = REQUEST_STATE.PENDING;
      this.updateBlog(blog)
        .then(updatedBlog => {
          this.savingTechnicalSettingsState = REQUEST_STATE.FINISHED_OK;
          this.appMessage = `"${updatedBlog.name}" technical settings have been saved.`;
        })
        .catch(e => {
          this.savingTechnicalSettingsState = REQUEST_STATE.FINISHED_ERROR;
        });
    },
    onDeleteBlogClick() {
      this.deleteBlogConfirmName = "";
      this.deleteBlogConfirmError = false;
      this.showDeleteBlogModal = true;
    },
    onDeleteBlogConfirm() {
      this.deleteBlogState = REQUEST_STATE.NOT_STARTED;
      if (this.deleteBlogConfirmName.trim() === this.blog.name.trim()) {
        this.deleteBlogState = REQUEST_STATE.PENDING;
        this.deleteBlogConfirmError = false;
        apolloClient
          .mutate({
            mutation: deleteBlogMutation,
            variables: {
              _id: this.$route.params.blogId
            }
          })
          .then(async () => {
            await apolloClient.resetStore();
            this.deleteBlogState = REQUEST_STATE.FINISHED_OK;
            this.$router.push({ name: "blogList" });
          })
          .catch(e => {
            throw new Error(e);
          });
      } else {
        this.deleteBlogConfirmError = true;
      }
    },
    prepareWebhooksValuesForSave() {
      const webhooks = [];
      console.log(
        "this.technicalSettingsForm.values",
        this.technicalSettingsForm.values
      );
      if (
        this.technicalSettingsForm.values.current.staticBuildWebhooks.trim()
      ) {
        let staticBuildWebhooksArray = this.technicalSettingsForm.values.current.staticBuildWebhooks.split(
          ","
        );
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
    }
  }
};
</script>
