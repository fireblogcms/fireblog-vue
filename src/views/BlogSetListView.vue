<template>
  <DefaultLayout>
    <div class="container mx-auto my-10">
      <template v-if="viewData">
        <div
          v-for="blogSet in viewData.blogSets"
          :key="blogSet._id"
          class="flex flex-col items-center"
        >
          <h2 class="text-4xl font-bold mt-5 mb-6">
            {{ blogSet.name }}'s blogs
          </h2>
          <BlogCard
            v-for="blog in blogSet.blogs"
            :blog="blog"
            :key="blog._id"
            class="w-full md:w-3/5 mb-16"
          />
        </div>
      </template>
      <template v-if="!viewData">
        <ContentLoader height="300" class="md:w-3/5 mx-auto">
          <rect x="0" y="0" rx="3" ry="3" height="55%" />
        </ContentLoader>
      </template>
    </div>
  </DefaultLayout>
</template>

<script>
import AppButton from "@/ui-kit/AppButton";
import { ContentLoader } from "vue-content-loader";
import AppPanel from "@/ui-kit/AppPanel";
import BlogCard from "@/components/BlogCard";
import apolloClient from "@/utils/apolloClient";
import BlogCreateForm from "@/components/BlogCreateForm";
import DefaultLayout from "@/layouts/DefaultLayout";
import gql from "graphql-tag";
import { REQUEST_STATE, toast } from "@/utils/helpers";
import { getMyBlogs } from "@/utils/helpers";

export default {
  components: {
    DefaultLayout,
    BlogCard,
    ContentLoader,
  },
  data() {
    return {
      viewData: null,
    };
  },
  created() {
    viewData().then(r => {
      this.viewData = r.data;
    });
  },
};

function viewData() {
  return apolloClient.query({
    query: gql`
      query myBlogSetsQuery {
        blogSets {
          name
          blogs {
            name
            status
            _id
            image
            description
            name
            subscription {
              id
              planId
              trialEnd
            }
          }
        }
      }
    `,
  });
}
</script>
