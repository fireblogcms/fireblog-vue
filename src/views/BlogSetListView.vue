<template>
  <DefaultLayout>
    <template v-if="viewData">
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
                  {{ $t("views.blogSetList.title") }}
                </h1>
                <PlanInformations :blogSet="blogSet" />
              </div>
            </div>
            <AppButton
              color="primary"
              class="mb-2"
              @click="onCreateNewBlogClick(blogSet)"
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

    <!-- PAYMENT SUCCESS MODAL -->
    <AppModal name="paymentSuccessModal">
      <div class="text-4xl font-bold" slot="header">
        {{ $t("views.blogSetList.paymentSuccess") }}
      </div>
      <div class="flex flex-col items-center" slot="body">
        <img
          class="h-64 mb-10 rounded"
          src="https://camo.githubusercontent.com/581d9802c9e5716113238cc2fcaf938bf2dad338/68747470733a2f2f6d656469612e67697068792e636f6d2f6d656469612f6248757134736355373255496f2f67697068792e676966"
        />
        <AppButton
          color="primary"
          @click="$store.commit('modalShowing/close', 'paymentSuccessModal')"
        >
          {{ $t("global.okayButton") }}
        </AppButton>
      </div>
    </AppModal>

    <!-- UNSUBSCRIBE SUCCESS MODAL -->
    <AppModal name="unsubscribeSuccessModal">
      <div class="text-4xl font-bold" slot="header">
        {{ $t("views.blogSetList.unsubscribeSuccess") }}
      </div>
      <div class="flex flex-col items-center" slot="body">
        <img
          loading="lazy"
          class="h-64 mb-10 rounded"
          src="https://s3.eu-west-3.amazonaws.com/app.fireblogcms.com/gifs/unsubscribe-sad.gif"
        />
        <AppButton
          color="primary"
          @click="
            $store.commit('modalShowing/close', 'unsubscribeSuccessModal')
          "
        >
          {{ $t("global.okayButton") }}
        </AppButton>
      </div>
    </AppModal>
  </DefaultLayout>
</template>

<script>
import AppButton from "@/ui-kit/AppButton";
import { ContentLoader } from "vue-content-loader";
import AppPanel from "@/ui-kit/AppPanel";
import AppModal from "@/ui-kit/AppModal";
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
    AppModal,
  },
  data() {
    return {
      viewData: null,
    };
  },
  mounted() {
    if (this.$route.query.status === "success") {
      this.$store.commit("modalShowing/open", "paymentSuccessModal");
    }
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
  methods: {
    onCreateNewBlogClick(blogSet) {
      const trialEnd = blogSet.subscription.trialEnd ?
        new Date(blogSet.subscription.trialEnd) :
        null;

      if (blogSet.subscription.id || (trialEnd && new Date() <= trialEnd)) {
        this.$router.push({
          name: "blogCreate",
          params: { blogSetId: blogSet._id },
        });
      } else {
        this.$store.commit("modalShowing/open", "freeTrialEndedModal");
      }
    },
  }
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
            }
            description
            name
          }
          subscription {
            id
            planId
            trialEnd
            status
          }
        }
      }
    `,
  });
}
</script>
