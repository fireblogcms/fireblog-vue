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
      <div class="mx-20">
        <div class="flex items-center justify-between py-12">
          <div class="flex items-center">
            <img
              class="w-16 h-16 mr-10"
              src="/images/books-icon.png"
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
          <AppCard
            v-for="edge in blogs.edges"
            :key="edge.node._id"
            class="mb-16"
          >
            <div
              class="h-64 flex items-center cursor-pointer bg-cover bg-center"
              :style="blogCardStyle(edge)"
              @click="onRowClick(edge, $event)"
            >
              <div class="w-full text-center text-white py-2 bg-blackOpacity50">
                <p class="text-3xl font-bold">{{ edge.node.name }}</p>
                <p class="text-xl italic" v-if="edge.node.description">
                  {{ edge.node.description }}
                </p>
              </div>
            </div>
            <div class="p-6 flex items-center justify-between">
              <PlanInformations :blog="edge.node"></PlanInformations>
              <AppButton
                type="primary-outlined"
                v-if="edge.node.subscription.trialEnd"
                @click="onSubscribeClick(edge.node, $event)"
              >
                <span>
                  {{ $t("global.subscribeButton").toUpperCase() }}
                </span>
              </AppButton>
            </div>
          </AppCard>
        </div>
      </div>
    </template>
  </DefaultLayout>
</template>

<script>
import AppButton from "@/ui-kit/AppButton";
import AppCard from "@/ui-kit/AppCard";
import AppPanel from "@/ui-kit/AppPanel";
import apolloClient from "@/utils/apolloClient";
import BlogCreateForm from "@/components/BlogCreateForm";
import DefaultLayout from "@/layouts/DefaultLayout";
import AppLoader from "@/components/AppLoader";
import gql from "graphql-tag";
import { REQUEST_STATE, toast } from "@/utils/helpers";
import logger from "@/utils/logger";
import gradient from "random-gradient";
import { getMyBlogs } from "@/utils/helpers";
import PlanInformations from "@/components/PlanInformations";

export default {
  components: {
    AppButton,
    AppCard,
    AppPanel,
    DefaultLayout,
    BlogCreateForm,
    AppLoader,
    PlanInformations
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
    blogCardStyle(edge) {
      const style = {};
      if (edge.node.image) {
        style.backgroundImage = `url(${edge.node.image})`;
      } else {
        style.background = gradient(edge.node._id);
      }
      return style;
    },
    buildLinkToPostList(item) {
      return { name: "postList", params: { blogId: item.node._id } };
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
    },
    onRowClick(item, event) {
      this.$router.push(this.buildLinkToPostList(item));
    },
    onSubscribeClick(blog) {
      this.$router.push({
        name: "plans",
        params: {
          blogId: blog._id
        }
      });
    }
  },
  created() {
    this.initData();
  }
};
</script>
