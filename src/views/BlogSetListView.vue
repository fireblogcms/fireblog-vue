<template>
  <DefaultLayout>
    <template v-if="viewData">
      <!--
      <AppPanel v-if="viewData.blogSets[0].blogs.length === 0">
        <BlogCreateForm :isFirstBlog="true" />
      </AppPanel>
      -->
      <div class="container mx-auto my-10">
        <div v-for="blogSet in viewData.blogSets" :key="blogSet._id">
          <div
            class="flex flex-col md:flex-row justify-between items-center md:items-start mb-20"
          >
            <div class="flex mb-12 md:mb-0">
              <img
                class="w-8 h-8 mr-4 md:w-16 md:h-16 md:mr-10"
                src="/images/books.png"
              />
              <div>
                <h1 class="text-xl md:text-4xl font-bold uppercase mb-2">
                  {{ $t("views.blogSetList.title", { user: blogSet.name }) }}
                </h1>
                <PlanInformations :blog="blogSet.blogs[0]" />
              </div>
            </div>
            <AppButton
              color="primary"
              class="mb-2"
              @click="
                $router.push({
                  name: 'blogCreate',
                  params: { blogSetId: blogSet._id },
                })
              "
            >
              {{ $t("views.blogList.createNewBlogButton").toUpperCase() }}
            </AppButton>
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
      </div>
    </template>
    <div class="container mx-auto my-10" v-if="!viewData">
      <ContentLoader height="160" class="md:w-3/5 mx-auto mb-16">
        <rect x="0" y="0" rx="3" ry="3" height="100%" />
      </ContentLoader>
      <ContentLoader height="160" class="md:w-3/5 mx-auto mb-16">
        <rect x="0" y="0" rx="3" ry="3" height="100%" />
      </ContentLoader>
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
    PlanInformations,
  },
  data() {
    return {
      viewData: null,
    };
  },
  created() {
    viewData().then(response => {
      if (response.data.blogSets[0].blogs.length === 0) {
        this.$router.replace({
          name: "blogCreate",
          params: { blogSetId: response.data.blogSets[0]._id },
          query: { first: 1 },
        });
      } else {
        this.viewData = response.data;
      }
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
            _id
            blogSet
            name
            status
            image {
              url
              alt
            }
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