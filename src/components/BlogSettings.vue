<template>
  <div>
    <AppLoader v-if="initDataState === 'PENDING'">Loading</AppLoader>
    <template v-if="initDataState === 'FINISHED_OK'">
      <BlogSettingsGeneral :blog="blog" />
      <BlogSettingsTechnical :blog="blog" />
      <BlogSettingsDeleteBlog :blog="blog" />
    </template>
  </div>
</template>

<script>
import { getBlog, REQUEST_STATE, appNotification } from "../utils/helpers";
import { formInitData } from "../utils/vuexForm";
import AppLoader from "../components/AppLoader";
import apolloClient from "../utils/apolloClient";
import BlogSettingsGeneral from "../components/BlogSettingsGeneral";
import BlogSettingsTechnical from "../components/BlogSettingsTechnical";
import BlogSettingsDeleteBlog from "../components/BlogSettingsDeleteBlog";
import gql from "graphql-tag";
import {
  deleteBlogMutation,
  getMyBlogsQuery,
  getUserQuery,
  updateBlogMutation
} from "../utils/queries";

export default {
  components: {
    AppLoader,
    BlogSettingsGeneral,
    BlogSettingsTechnical,
    BlogSettingsDeleteBlog
  },
  data() {
    return {
      blog: null,
      initDataState: REQUEST_STATE.NOT_STARTED
    };
  },
  created() {
    this.initData();
  },
  methods: {
    initData() {
      this.initDataState = REQUEST_STATE.PENDING;
      getBlog(this.$route.params.blogId)
        .then(blog => {
          this.blog = blog;
          this.initDataState = REQUEST_STATE.FINISHED_OK;
        })
        .catch(error => {
          appNotification(error, "error");
          this.initDataState = REQUEST_STATE.FINISHED_ERROR;
        });
    }
  }
};
</script>
