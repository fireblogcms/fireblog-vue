<template>
  <DefaultLayout>
    <!-- TOPBAR LEFT BUTTONS -->
    <portal to="topbar-left">
      <AppBreadcrumb
        :routerOptions="{
          name: 'tagList',
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
      <TagForm
        :operation="operation()"
        :blogId="$route.params.blogId"
        :tag="tag"
      />
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
import { FullTagFragment } from "@/utils/queries";
import { toast } from "@/utils/helpers";

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
    operation() {
      return this.$route.name === "tagCreate" ? "CREATE" : "UPDATE";
    },
    initData() {
      if (this.operation() === "CREATE") {
        this.initDataState = "FINISHED_OK";
      }
      if (this.operation() === "UPDATE") {
        this.initDataState = "PENDING";
        const query = gql`
          ${FullTagFragment}
          query tagQuery($tagId: ID!) {
            tag(filter: { _id: { eq: $tagId } }) {
              ...FullTagFragment
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
      }
    },
  },
};
</script>
