<template>
  <DefaultLayout>
    <!-- TOPBAR LEFT BUTTONS -->

    <portal to="topbar-left">
      <AppBreadcrumb
        image="/images/books.png"
        :routerOptions="{ name: 'blogSetList' }"
        :name="$t('views.postList.backToBlogLink')"
      />
    </portal>

    <AppLoader v-if="initDataState === 'PENDING'" />

    <div class="max-w-4xl mx-auto">
      <h1 class="md:text-2xl text-xl font-bold uppercase mb-4 px-5 mt-10">
        {{ $t("topbar.accountMenu.myAccount") }}
      </h1>

      <AppPanel v-if="initDataState === 'FINISHED_OK'">
        <div
          class="flex flex-row flex-row-reverse items-center justify-between"
        >
          <div>
            <img
              class="w-32 h-32 rounded-full shadow"
              :src="viewData.me.picture"
              alt="User's profile picture"
            />
          </div>
          <div>
            <p class="text-2xl font-bold">
              {{ viewData.me.name }}
            </p>
            <p class="text-xl text-indigo-600">
              {{ viewData.me.email }}
            </p>
          </div>
        </div>
        <div class="mt-5">
          <PlanInformations :blogSet="viewData.blogSets[0]" />
        </div>
      </AppPanel>
    </div>
  </DefaultLayout>
</template>

<script>
import AppLoader from "@/ui-kit/AppLoader";
import AppPanel from "@/ui-kit/AppPanel";
import apolloClient from "@/utils/apolloClient";
import { REQUEST_STATE, getUser, toast } from "@/utils/helpers";
import gql from "graphql-tag";
import DefaultLayout from "@/layouts/DefaultLayout";
import PlanInformations from "@/components/PlanInformations";
import AppBreadcrumb from "@/ui-kit/AppBreadcrumb";

export default {
  components: {
    AppLoader,
    AppPanel,
    DefaultLayout,
    PlanInformations,
    AppBreadcrumb,
  },
  data() {
    return {
      viewData: null,
      initDataState: REQUEST_STATE.NOT_STARTED,
    };
  },
  methods: {
    initData() {
      this.initDataState = REQUEST_STATE.PENDING;
      viewData()
        .then(response => {
          this.viewData = response.data;
          this.initDataState = REQUEST_STATE.FINISHED_OK;
        })
        .catch(error => {
          this.initDataState = REQUEST_STATE.FINISHED_ERROR;
          toast(this, "Sorry, an error occured while loading page.", "error");
          throw new Error(error);
        });
    },
  },
  created() {
    this.initData();
  },
};

function viewData() {
  return apolloClient.query({
    query: gql`
      query myBlogSetsQuery {
        blogSets {
          _id
          name
          subscription {
            id
            planId
            trialEnd
            numberDaysLeftTrial
            status
          }
        }
        me {
          _id
          customerId
          name
          email
          createdAt
          updatedAt
          picture
          memberships {
            scopeId
            resourceId
            roles
          }
        }
      }
    `,
  });
}
</script>
