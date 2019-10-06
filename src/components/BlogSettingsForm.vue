<template>
  <div>
    <pre v-if="false">{{form}}</pre>
    <AppLoader v-if="initDataState === 'PENDING'">Loading blogs</AppLoader>
    <AppError v-if="errorMessage">{{errorMessage}}</AppError>
    <AppMessage v-if="appMessage">{{appMessage}}</AppMessage>
    <LayoutBody
      style="margin:40px;padding:40px;"
      class="container"
      v-if="initDataState === 'FINISHED_OK'"
    >
      <form @submit.prevent="onFormSubmit">
        <div class="field">
          <label class="label">Name</label>
          <div class="control">
            <input v-model="form.values.current.name" class="input is-large" type="text" />
          </div>
        </div>
        <div class="field">
          <label class="label">Description</label>
          <div class="control">
            <input class="input is-large" v-model="form.values.current.description" type="text" />
          </div>
        </div>
        <div class="field">
          <label class="label">Webhooks</label>
          <textarea
            v-model="form.values.current.webhooks"
            class="textarea"
            placeholder="e.g. Hello world"
          ></textarea>
          <p
            class="help"
          >You can specify multiple valid URLs by comma-separating them. Webhooks will be ping on each post update, delete and create.</p>
        </div>
        <div>
          <button
            style="margin-top:20px;"
            class="button is-outlined is-primary is-large"
            :class="{ 'is-loading': savingBlogState === 'PENDING'}"
            :disabled="savingBlogState === 'PENDING'"
            type="submit"
          >Save</button>
        </div>
      </form>
    </LayoutBody>
  </div>
</template>

<script>
import LayoutBody from "../components/LayoutBody";
import { getBlog, REQUEST_STATE, formInitData } from "../utils/helpers";
import AppLoader from "../components/AppLoader";
import AppError from "../components/AppError";
import AppMessage from "../components/AppMessage";
import apolloClient from "../utils/apolloClient";
import gql from "graphql-tag";

const initialFormValues = {
  name: "",
  description: "",
  webhooks: ""
};

export default {
  components: {
    LayoutBody,
    AppLoader,
    AppError,
    AppMessage,
    LayoutBody
  },
  data() {
    return {
      blog: null,
      initDataState: REQUEST_STATE.NOT_STARTED,
      savingBlogState: REQUEST_STATE.NOT_STARTED,
      form: formInitData({ initialFormValues }),
      errorMessage: null,
      appMessage: null
    };
  },
  created() {
    this.initData();
  },
  methods: {
    validateForm() {
      const errors = {};
      if (!this.form.values.name.trim()) {
        errors.name = "Name is required";
      }
      return errors;
    },
    updateBlog(blog) {
      this.savingBlogState = REQUEST_STATE.PENDING;
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
        .then(result => {
          this.savingBlogState = REQUEST_STATE.FINISHED_OK;
          return result.data.updateBlog;
        })
        .catch(error => {
          this.savingBlogState = REQUEST_STATE.FINISHED_ERROR;
          this.errorMessage = error;
          throw new Error(error);
        });
    },
    prepareBlogObjectFromInputs() {
      const blog = {
        _id: this.$route.params.blogId,
        name: this.form.values.current.name,
        description: this.form.values.current.description
      };
      const webhooks = [];
      if (this.form.values.current.webhooks.trim()) {
        let webhooksArray = this.form.values.current.webhooks.split(",");
        // remove extra spaces
        webhooksArray = webhooksArray.map(webhook => webhook.trim());
        webhooksArray.forEach(webhook => {
          webhooks.push({
            name: webhook,
            url: webhook,
            onEvents: [
              "post:update",
              "post:create",
              "post:delete",
              "blog:update"
            ]
          });
        });
        blog.webhooks = webhooks;
      } else {
        blog.webhooks = [];
      }
      return blog;
    },
    initData() {
      this.errorMessage = null;
      this.initDataState = REQUEST_STATE.PENDING;
      getBlog(this.$route.params.blogId)
        .then(blog => {
          this.blog = blog;
          this.initDataState = REQUEST_STATE.FINISHED_OK;
          this.form = formInitData({
            initialFormValues: {
              ...initialFormValues,
              name: blog.name,
              description: blog.description,
              webhooks: blog.webhooks
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
    onFormSubmit() {
      const blog = this.prepareBlogObjectFromInputs();
      this.updateBlog(blog).then(updatedBlog => {
        this.appMessage = `"${updatedBlog.name}" settings have been saved.`;
      });
    }
  }
};
</script>
