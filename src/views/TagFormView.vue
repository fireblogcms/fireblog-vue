<template>
  <DefaultLayout>
    <!-- TOPBAR LEFT BUTTONS -->
    <portal to="topbar-left">
      <AppBreadcrumb
        :routerOptions="{
          name: 'blogSettings',
          params: {
            blogId: $route.params.blogId,
            blogSetId: $route.params.blogSetId,
          },
        }"
        :name="$t('views.tagForm.backToBlogLink')"
      />
    </portal>

    <!-- END TOPBAR LEFT BUTTONS -->
    <AppLoader v-if="initDataState === 'PENDING'" />
    <div
      v-if="initDataState === 'FINISHED_OK'"
      class="bg-white shadow max-w-900 mt-10 mx-auto p-10 rounded"
    >
      <TagForm :tag="tag" />
    </div>
  </DefaultLayout>
</template>

<script>
import TagForm from "@/components/TagForm";
import DefaultLayout from "@/layouts/DefaultLayout";
import AppBreadcrumb from "@/ui-kit/AppBreadcrumb";
import AppLoader from "@/ui-kit/AppLoader";
import apolloClient from "@/utils/apolloClient";
import gql from "graphql-tag";

export default {
  components: {
    TagForm,
    DefaultLayout,
    AppBreadcrumb,
    AppLoader,
  },
  data() {
    return {
      tag: null,
      initDataState: "NOT_STARTED",
    };
  },
  mounted() {
    this.initData();
  },
  methods: {
    initData() {
      this.initDataState = "PENDING";
      const query = gql`
        query blogTagsQuery($tagId: ID!) {
          tag(filter: { _id: { eq: $tagId } }) {
            _id
            name
            description
            slug
          }
        }
      `;
      return apolloClient
        .query({
          query,
          variables: {
            tagId: this.$route.params.tagId,
          },
        })
        .then(response => {
          this.tag = response.data.tag;
          this.initDataState = "FINISHED_OK";
        })
        .catch(e => {
          toast(this, e, "error");
          throw new Error(e);
          this.initDataState = "FINISHED_ERROR";
        });
    },
  },
};
</script>
