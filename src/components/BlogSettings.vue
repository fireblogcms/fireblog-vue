<template>
  <div>
    <AppLoader v-if="initDataState === 'PENDING'" />

    <template v-if="initDataState === 'FINISHED_OK'">
      <BlogSettingsGeneral :blog="blog" />
      <BlogSettingsTechnical :blog="blog" />
      <BlogSettingsTeam :blog="blog" />
      <BlogSettingsDeleteBlog :blog="blog" />
    </template>
  </div>
</template>

<script>
import AppLoader from "@/ui-kit/AppLoader";
import { getBlog, REQUEST_STATE, toast } from "@/utils/helpers";
import { vuexFormInitData } from "@/utils/vuexForm";
import apolloClient from "@/utils/apolloClient";
import BlogSettingsGeneral from "@/components/BlogSettingsGeneral";
import BlogSettingsTeam from "@/components/BlogSettingsTeam";
import BlogSettingsTechnical from "@/components/BlogSettingsTechnical";
import BlogSettingsDeleteBlog from "@/components/BlogSettingsDeleteBlog";
import gql from "graphql-tag";
import {
  deleteBlogMutation,
  getMyBlogsQuery,
  getUserQuery,
  updateBlogMutation,
} from "@/utils/queries";

export default {
  components: {
    AppLoader,
    BlogSettingsGeneral,
    BlogSettingsTechnical,
    BlogSettingsDeleteBlog,
    BlogSettingsTeam,
  },
  data() {
    return {
      blog: null,
      initDataState: REQUEST_STATE.NOT_STARTED,
    };
  },
  mounted() {
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
          toast(this, error, "error");
          this.initDataState = REQUEST_STATE.FINISHED_ERROR;
        });
    },
  },
};
</script>
