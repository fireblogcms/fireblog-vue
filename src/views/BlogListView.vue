<template>
  <DefaultLayout>
    <AppLoader v-if="initDataState === 'PENDING'">Loading blogs</AppLoader>

    <!-- if this is the first blog, display form to create a blog -->
    <template
      v-if="
        initDataState === 'FINISHED_OK' && blogs && blogs.edges.length === 0
      "
    >
      <AppPanel>
        <BlogCreateForm :isMyFirstBlog="true" />
      </AppPanel>
    </template>
    <!-- else, display the blog list -->
    <template
      v-if="initDataState === 'FINISHED_OK' && blogs && blogs.edges.length > 0"
    >
      <div class="mx-20 my-12">
        <div class="flex items-center justify-between pb-12">
          <div class="flex items-center">
            <img
              class="w-16 h-16 mr-10"
              src="/images/books.png"
            />
            <h1 class="text-5xl font-bold uppercase">{{ $t("views.blogList.title") }}</h1>
          </div>
          <AppButton
            type="primary"
            @click="$router.push({ name: 'blogCreate' })"
          >
            {{ $t("views.blogList.createNewBlogButton").toUpperCase() }}
          </AppButton>
        </div>
        <div class="pt-10 flex flex-col items-center">
          <BlogCard
            v-for="edge in blogs.edges"
            :blog="edge.node"
            :key="edge.node._id"
            class="w-3/5 mb-16"
          />
        </div>
      </div>
    </template>
  </DefaultLayout>
</template>

<script>
import AppButton from "@/ui-kit/AppButton";
import AppPanel from "@/ui-kit/AppPanel";
import BlogCard from "@/components/BlogCard";
import apolloClient from "@/utils/apolloClient";
import BlogCreateForm from "@/components/BlogCreateForm";
import DefaultLayout from "@/layouts/DefaultLayout";
import AppLoader from "@/components/AppLoader";
import gql from "graphql-tag";
import { REQUEST_STATE, toast } from "@/utils/helpers";
import { getMyBlogs } from "@/utils/helpers";

export default {
  components: {
    AppButton,
    AppPanel,
    BlogCard,
    DefaultLayout,
    BlogCreateForm,
    AppLoader
  },
  data() {
    return {
      blogs: null,
      initDataState: REQUEST_STATE.NOT_STARTED
    };
  },
  methods: {
    initData() {
      this.initDataState = REQUEST_STATE.PENDING;
      Promise.all([this.getBlogs()])
        .then(() => {
          this.initDataState = REQUEST_STATE.FINISHED_OK;
        })
        .catch(error => {
          this.initDataState = REQUEST_STATE.FINISHED_ERROR;
          throw new Error(error);
        });
    },
    getBlogs() {
      return getMyBlogs()
        .then(blogs => {
          this.blogs = blogs;
          return blogs;
        })
        .catch(error => {
          toast(
            this,
            "Sorry, an error occured while fetching blog:" + error,
            "error"
          );
          throw new Error(error);
        });
    }
  },
  created() {
    this.initData();
  }
};
</script>
