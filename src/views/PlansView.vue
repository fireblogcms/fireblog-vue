<template>
  <DefaultLayout>
    <!-- TOPBAR LEFT BUTTONS -->
    <portal to="topbar-left">
      <AppBreadcrumb
        image="/images/books.png"
        link="blogList"
        :name="$t('views.postList.backToBlogLink')"
      />
    </portal>
    <!-- END TOPBAR LEFT BUTTONS -->

    <div class="container mx-auto my-10 text-center">
      <div class="flex justify-center mb-16" v-if="freePlan">
        <div class="w-8/12 p-8 bg-white shadow-lg rounded-lg">
          <p>
            {{ $t("views.plans.freeTrialFirst") }}
            {{ freePlan.productName }}
            {{ $t("views.plans.freeTrialSecond", { daysFreeTrial }) }}
          </p>
        </div>
      </div>

      <h1 class="mb-8 text-5xl font-bold uppercase">
        {{ $t("views.plans.title") }}
      </h1>
      <p class="font-bold">
        {{ $t("views.plans.introduction") }}
      </p>
      <p>✔️ {{ $t("views.plans.benefices.webhooks") }}</p>
      <p>✔️ {{ $t("views.plans.benefices.editor") }}</p>
      <p>✔️ <span v-html="$t('views.plans.benefices.gatsby')" /></p>

      <div
        class="mt-10 flex flex-col md:flex-row justify-between"
        v-if="plans.length > 0"
      >
        <div
          class="w-full md:w-1/4 my-4 md:mx-4 p-6 flex flex-col items-center justify-between bg-white shadow-lg rounded-lg border-4"
          :class="isPlanSubscribed(plan.id) ? 'border-primary' : 'border-transparent'"
          v-for="plan in plans" :key="plan.id"
        >
          <div>
            <p class="mb-4 text-2xl font-bold">{{ plan.productName }}</p>
            <p class="mb-4 font-bold">
              {{ $t(plan.metadata.SUBTITLE) }}
            </p>
            <p class="mb-4 text-xl font-bold">
              {{ (parseInt(plan.amountTaxes) / 100).toFixed(2) }}
              {{ $t("views.plans.eurosPerMonth") }}
            </p>
            <p class="font-bold">
              {{ $t("views.plans.includes") }}
            </p>
            <p>
              {{ plan.metadata.API_CALLS_MONTH }}
              {{ $t("views.plans.apiCalls") }}
            </p>
            <p class="mb-8">
              {{ plan.metadata.STORAGE_GB }} 
              {{ $t("views.plans.storageUnitGB") }} 
              {{ $t("views.plans.storage") }}
            </p>
          </div>
          <AppButton
            v-if="!isPlanSubscribed(plan.id)"
            :loading="subscribeRequest.state === 'PENDING' && subscribeRequest.planId === plan.id"
            @click="onSubscribeClick(plan)"
            color="primary"
            size="small"
          >
            {{ $t("global.subscribeButton") }}
          </AppButton>
        </div>
      </div>

      <!-- Loading placeholders -->
      <div
        class="mt-10 flex flex-col md:flex-row justify-between"
        v-if="plans.length === 0"
      >
        <div
          class="w-full md:w-1/4 my-4 md:mx-4 p-6 bg-white shadow-lg rounded-lg border-4 border-transparent" 
          v-for="(v, i) in [0, 1, 2, 3]"
          :key="i"
        >
          <ContentLoader :height="500">
            <rect x="0" y="0" rx="3" ry="3" width="100%" height="60" />
            <rect x="0" y="120" rx="3" ry="3" width="100%" height="20" />
            <rect x="0" y="160" rx="3" ry="3" width="100%" height="20" />
            <rect x="0" y="260" rx="3" ry="3" width="100%" height="40" />
            <rect x="0" y="360" rx="3" ry="3" width="100%" height="20" />
            <rect x="0" y="400" rx="3" ry="3" width="100%" height="20" />
            <rect x="0" y="440" rx="3" ry="3" width="100%" height="20" />
          </ContentLoader>
        </div>
      </div>
    </div>

    <!-- CHANGE PLAN MODAL -->
    <AppModal name="changePlanModal">
      <div class="text-4xl font-bold" slot="header">
        {{ $t("views.plans.changePlanModal.title") }}
      </div>
      <div class="flex flex-col items-center" slot="body">
        <p class="text-xl">
          {{ $t("views.plans.changePlanModal.body", {
            planName: changePlanModal.plan.productName,
            planAmount: (parseInt(changePlanModal.plan.amountTaxes) / 100).toFixed(2)
          }) }}
        </p>
        <AppButton
          class="mt-10"
          color="primary"
          @click="changePlan(changePlanModal.plan)"
        >
          {{ $t("global.subscribeButton") }}
        </AppButton>
      </div>
    </AppModal>
  </DefaultLayout>
</template>

<script>
import AppButton from "@/ui-kit/AppButton";
import AppBreadcrumb from "@/ui-kit/AppBreadcrumb";
import AppModal from "@/ui-kit/AppModal";
import DefaultLayout from "@/layouts/DefaultLayout";
import apolloClient from "@/utils/apolloClient";
import {
  getPlansQuery,
  updateBlogMutation
} from "@/utils/queries";
import { ContentLoader } from "vue-content-loader";
import {
  getBlog,
  getUser,
  getPlan,
  createStripeCheckoutSession,
  toast,
  REQUEST_STATE
} from "@/utils/helpers";

export default {
  components: {
    AppButton,
    AppBreadcrumb,
    AppModal,
    DefaultLayout,
    ContentLoader
  },
  data() {
    return {
      subscribeRequest: {
        state: REQUEST_STATE.NOT_STARTED,
        planId: null
      },
      daysFreeTrial: process.env.VUE_APP_DAYS_FREE_TRIAL,
      blog: {},
      freePlan: null,
      plans: [],
      changePlanModal: {
        plan: {}
      }
    };
  },
  created() {
    this.fetchData();
  },
  mounted() {
    let stripeScript = document.createElement("script");
    stripeScript.setAttribute("src", "https://js.stripe.com/v3/");
    document.head.appendChild(stripeScript);
  },
  methods: {
    async onSubscribeClick(plan) {
      const user = await getUser();
      if (!this.blog.subscription.id) {
        this.subscribeRequest.state = REQUEST_STATE.PENDING;
        this.subscribeRequest.planId = plan.id;
        const stripe = Stripe(process.env.VUE_APP_STRIPE_PUBLIC_KEY);
        const sessionId = await createStripeCheckoutSession({
          userEmail: user.email,
          userId: user._id,
          ...(user.customerId && {
            customerId: user.customerId
          }),
          blogId: this.$route.params.blogId,
          planId: plan.id,
          successUrl: `${process.env.VUE_APP_BASE_URL}/blog/${this.$route.params.blogId}`,
          cancelUrl: `${process.env.VUE_APP_BASE_URL}/blog/${this.$route.params.blogId}/plans`
        });
        stripe
          .redirectToCheckout({
            sessionId
          })
          .then(r => {
            this.subscribeRequest.state = REQUEST_STATE.FINISHED_OK;
            console.log(r);
          })
          .catch(error => {
            console.log(error);
            this.subscribeRequest.state = REQUEST_STATE.FINISHED_ERROR;
            toast(this, error, "error");
            throw new Error(error);
          });
      } else {
        this.changePlanModal = {
          plan
        };
        this.$store.commit("modalShowing/open", "changePlanModal");
      }
    },
    changePlan(plan) {
      const subscription = {
        id: this.blog.subscription.id,
        planId: plan.id
      };
      return apolloClient
        .mutate({
          mutation: updateBlogMutation,
          variables: {
            blog: {
              _id: this.$route.params.blogId,
              subscription
            }
          }
        })
        .then(result => {
          this.$router
            .push({
              name: "postList",
              params: { blogId: result.data.updateBlog._id }
            })
            .then(() => {
              this.$store.commit("modalShowing/open", "paymentSuccessModal");
            });
          return result.data.updateBlog;
        })
        .catch(error => {
          toast(this, error, "error");
          throw new Error(error);
        });
    },
    async fetchData() {
      this.blog = await getBlog(this.$route.params.blogId);
      if (this.blog.subscription.trialEnd) {
        this.freePlan = await getPlan();
      }
      return apolloClient
        .query({
          query: getPlansQuery
        })
        .then(result => {
          this.plans = result.data.plans;
          return result;
        })
        .catch(error => {
          toast(
            this,
            "Sorry, an error occured while fetching pricing",
            "error"
          );
          throw new Error(error);
        });
    },
    isPlanSubscribed(planId) {
      return (
        !this.blog.subscription.trialEnd &&
        this.blog.subscription.planId === planId
      );
    }
  }
};
</script>
