<template>
  <div>
    <pre v-if="false">{{ generalSettingsForm }}</pre>
    <AppLoader v-if="initDataState === 'PENDING'">Loading</AppLoader>

    <template v-if="initDataState === 'FINISHED_OK'">
      <AppPanel
        style="margin-top:40px;margin-bottom:40px;padding:40px;"
        class="container"
        v-if="initDataState === 'FINISHED_OK'"
      >
        <h2 class="title is-2">{{ $t("views.blogSettings.generalSettingsForm.title") }}</h2>
        <form @submit.prevent="onGeneralSettingsFormSubmit">
          <div class="field">
            <label class="label">
              {{
              $t("views.blogSettings.generalSettingsForm.fields.name.label")
              }}
            </label>
            <div class="control">
              <input
                v-model="generalSettingsForm.values.current.name"
                class="input is-large"
                type="text"
                maxlength="100"
              />
            </div>
            <p
              class="help is-danger"
              v-if="generalSettingsForm.errors.name"
            >{{ generalSettingsForm.errors.name }}</p>
          </div>
          <div class="field">
            <label class="label">Description (250 characters max)</label>
            <div class="control">
              <textarea
                class="textarea is-large"
                v-model="generalSettingsForm.values.current.description"
                type="text"
                maxlength="250"
              ></textarea>
            </div>
          </div>

          <div class="field">
            <label class="label">Couverture du blog</label>
            <S3ImageUpload
              style="max-width:600px;"
              :blogId="$route.params.blogId"
              @onUploadingStateChange="onUploadingStateChange"
              :initialImage="generalSettingsForm.values.initial.image"
              @onUploaded="onUploaded"
            />
          </div>
          <div>
            <button
              style="margin-top:20px;"
              class="button is-outlined is-primary is-large"
              :class="{
                'is-loading': savingGeneralSettingsState === 'PENDING'
              }"
              :disabled="
                uploadBlogImageState === 'PENDING' ||
                  savingGeneralSettingsState === 'PENDING'
              "
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
              $t("views.blogSettings.technicalSettingsForm.fields.url.label")
              }}
            </label>
            <div class="control">
              <input
                v-model="technicalSettingsForm.values.current.url"
                class="input is-large"
                type="text"
                maxlength="100"
              />
            </div>
            <p
              class="help is-danger"
              v-if="technicalSettingsForm.errors.url"
            >{{ technicalSettingsForm.errors.url }}</p>
          </div>
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
        >{{ $t("views.blogSettings.dangerZone.deleteBlog") }}</button>
      </AppPanel>

      <BulmaModal class="api-modal" v-model="showDeleteBlogModal">
        <template #title>
          Detele
          <em>{{ blog.name }}</em>
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
            :class="{ 'is-loading': deleteBlogState === 'PENDING' }"
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
import { getBlog, REQUEST_STATE, appNotification } from "../utils/helpers";
import { formInitData } from "../utils/vuexForm";
import AppLoader from "../components/AppLoader";
import apolloClient from "../utils/apolloClient";
import gql from "graphql-tag";
import BulmaModal from "./BulmaModal";
import S3ImageUpload from "./S3ImageUpload";
import {
  deleteBlogMutation,
  getMyBlogsQuery,
  getUserQuery,
  updateBlogMutation
} from "../utils/queries";

const initialGeneralSettingsFormValues = {
  name: "",
  description: "",
  image: null
};

const initialTechnicalSettingsFormValues = {
  staticBuildWebhooks: [],
  url: null
};

export default {
  components: {
    AppPanel,
    AppLoader,
    AppPanel,
    BulmaModal,
    S3ImageUpload
  },
  data() {
    return {
      blog: null,
      initDataState: REQUEST_STATE.NOT_STARTED,
      savingGeneralSettingsState: REQUEST_STATE.NOT_STARTED,
      uploadBlogImageState: REQUEST_STATE.NOT_STARTED,
      savingTechnicalSettingsState: REQUEST_STATE.NOT_STARTED,
      deleteBlogState: REQUEST_STATE.NOT_STARTED,
      showDeleteBlogModal: false,
      deleteBlogConfirmName: "",
      deleteBlogConfirmError: false,
      generalSettingsForm: formInitData({
        initialValues: initialGeneralSettingsFormValues
      }),
      technicalSettingsForm: formInitData({
        initialValues: initialTechnicalSettingsFormValues
      })
    };
  },
  created() {
    this.initData();
  },
  methods: {
    onUploadingStateChange(state) {
      this.uploadBlogImageState = state;
    },
    onUploaded(fileUrl) {
      this.generalSettingsForm.values.current.image = fileUrl;
    },
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
    },
    initData() {
      this.initDataState = REQUEST_STATE.PENDING;
      getBlog(this.$route.params.blogId)
        .then(blog => {
          this.blog = blog;
          this.initDataState = REQUEST_STATE.FINISHED_OK;
          this.generalSettingsForm = formInitData({
            initialValues: {
              ...initialGeneralSettingsFormValues,
              name: blog.name,
              description: blog.description,
              image: blog.image
            }
          });
          this.technicalSettingsForm = formInitData({
            initialValues: {
              ...initialTechnicalSettingsFormValues,
              url: blog.url,
              staticBuildWebhooks: blog.webhooks
                ? blog.webhooks.map(webhook => webhook.url).join(",")
                : ""
            }
          });
        })
        .catch(error => {
          appNotification(error, "error");
          this.initDataState = REQUEST_STATE.FINISHED_ERROR;
        });
    },
    onGeneralSettingsFormSubmit() {
      this.validateGeneralSettingsForm();
      if (Object.keys(this.generalSettingsForm.errors).length > 0) {
        const message = Object.keys(this.generalSettingsForm.errors)
          .map(key => this.generalSettingsForm.errors[key])
          .join(". ");
        appNotification(message, "error");
        return;
      } else {
        this.savingGeneralSettingsState = REQUEST_STATE.PENDING;
        const blog = {
          _id: this.$route.params.blogId,
          name: this.generalSettingsForm.values.current.name,
          description: this.generalSettingsForm.values.current.description,
          image: this.generalSettingsForm.values.current.image
        };
        this.updateBlog(blog)
          .then(updatedBlog => {
            this.savingGeneralSettingsState = REQUEST_STATE.FINISHED_OK;
            appNotification(
              `"${updatedBlog.name}" general settings have been saved.`
            );
          })
          .catch(e => {
            this.savingGeneralSettingsState = REQUEST_STATE.FINISHED_ERROR;
          });
      }
    },
    onTechnicalSettingsFormSubmit() {
      const webhooks = this.prepareWebhooksValuesForSave();
      const update = {
        _id: this.$route.params.blogId,
        webhooks,
        url: this.technicalSettingsForm.values.current.url.trim()
      };
      this.savingTechnicalSettingsState = REQUEST_STATE.PENDING;
      this.updateBlog(update)
        .then(updatedBlog => {
          this.savingTechnicalSettingsState = REQUEST_STATE.FINISHED_OK;
          appNotification(
            `"${updatedBlog.name}" technical settings have been saved.`,
            "info",
            { persistAfterRouteChange: true }
          );
        })
        .catch(e => {
          appNotification(e, "error");
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
            appNotification(e, "error");
            throw new Error(e);
          });
      } else {
        this.deleteBlogConfirmError = true;
      }
    },
    prepareWebhooksValuesForSave() {
      const webhooks = [];
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
