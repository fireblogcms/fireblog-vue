<template>
  <DefaultLayout>
    <div class="container mx-auto my-10">
      <template v-if="viewData">
        <div
          v-for="blogSet in viewData.blogSets"
          :key="blogSet._id"
        >
          <div class="flex flex-col md:flex-row items-center justify-between mb-16">
            <div class="flex items-center mb-8 md:mb-0">
              <img class="w-16 h-16 mr-10" src="/images/books.png" />
              <h1 class="text-3xl md:text-5xl font-bold uppercase">
                <h2 class="text-4xl font-bold mt-5 mb-6 mr-5">
                  {{ $t("views.blogSetList.title", { user: blogSet.name }) }}
                </h2>
              </h1>
            </div>
            <PlanInformations :blog="blogSet.blogs[0]" class="mb-8 md:mb-0" />
            <div class="flex flex-col items-center">
              <AppButton
                color="primary"
                class="mb-2"
                @click="
                  $router.push({
                    name: 'blogCreate',
                    params: { blogSetId: blogSet._id }
                  })
                "
              >
                {{ $t("views.blogList.createNewBlogButton").toUpperCase() }}
              </AppButton>
              <AppButton
                color="primary-outlined"
                @click="$router.push({
                  name: 'plans',
                  params: { blogId: blogSet.blogs[0]._id }
                })"
              >
                {{ $t("global.subscribeButton").toUpperCase() }}
              </AppButton>
            </div>
          </div>
          <div
            v-if="blogSet.blogs.length > 0"
            class="flex flex-col items-center"
          >
            <BlogCard
              v-for="blog in blogSet.blogs"
              :blogSet="blogSet"
              :blog="blog"
              :key="blog._id"
              class="w-full md:w-3/5 mb-16"
            />
          </div>
        </div>
      </template>
      <template v-if="!viewData">
        <ContentLoader height="200" class="md:w-3/5 mx-auto">
          <rect x="0" y="0" rx="3" ry="3" height="100%" />
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
import PlanInformations from "@/components/PlanInformations";
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
    AppButton,
    PlanInformations
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
          _id
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
