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
    <!-- END TOPBAR LEFT BUTTONS -->

    <div class="container mx-auto my-10 text-center">
      <div
        class="flex justify-center mb-16"
        v-if="
          blogSet.subscription &&
            blogSet.subscription.trialEnd &&
            !blogSet.subscription.hasToSubscribe
        "
      >
        <div class="w-8/12 p-8 bg-white shadow-md rounded-lg">
          <p>
            {{ $t("views.plans.freeTrialFirst") }}
            {{ blogSet.subscription.plan.productName }}
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
        class="mt-10 flex flex-col md:flex-row justify-around"
        v-if="plans.length > 0"
      >
        <div
          class="w-full md:w-1/3 my-4 md:mx-4 p-6 flex flex-col items-center justify-between bg-white shadow-md rounded-lg border-4"
          :class="
            isPlanSubscribed(plan.id) ? 'border-primary' : 'border-transparent'
          "
          v-for="plan in plans"
          :key="plan.id"
        >
          <div>
            <p class="mb-4 text-2xl font-bold">{{ plan.productName }}</p>
            <p class="mb-4 font-bold" v-html="$t(plan.metadata.SUBTITLE)"></p>
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
            v-if="isPlanSubscribed(plan.id)"
            @click="$store.commit('modalShowing/open', 'unsubscribeModal')"
            color="primary-outlined"
            size="small"
          >
            {{ $t("global.unsubscribeButton") }}
          </AppButton>
          <AppButton
            v-if="!isPlanSubscribed(plan.id)"
            :loading="
              subscribeRequest.state === 'PENDING' &&
                subscribeRequest.planId === plan.id
            "
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
        class="mt-10 flex flex-col md:flex-row justify-around"
        v-if="plans.length === 0"
      >
        <div
          class="w-full md:w-1/3 my-4 md:mx-4 p-6 bg-white shadow-md rounded-lg border-4 border-transparent"
          v-for="(v, i) in [0, 1, 2]"
          :key="i"
        >
          <ContentLoader :height="400">
            <rect x="20%" y="0" rx="3" ry="3" width="60%" height="50" />
            <rect x="5%" y="80" rx="3" ry="3" width="90%" height="20" />
            <rect x="25%" y="110" rx="3" ry="3" width="50%" height="20" />
            <rect x="20%" y="160" rx="3" ry="3" width="60%" height="40" />
            <rect x="35%" y="230" rx="3" ry="3" width="30%" height="20" />
            <rect x="30%" y="260" rx="3" ry="3" width="40%" height="20" />
            <rect x="30%" y="290" rx="3" ry="3" width="40%" height="20" />
            <rect x="25%" y="340" rx="3" ry="3" width="50%" height="60" />
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
          {{
            $t("views.plans.changePlanModal.body", {
              planName: changePlanModal.plan.productName,
              planAmount: (
                parseInt(changePlanModal.plan.amountTaxes) / 100
              ).toFixed(2),
            })
          }}
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

    <!-- UNSUBSCRIBE MODAL -->
    <AppModal name="unsubscribeModal">
      <div class="text-4xl font-bold" slot="header">
        {{ $t("views.plans.unsubscribeModal.title") }}
      </div>
      <div class="flex flex-col items-center" slot="body">
        <p class="text-xl">
          {{ $t("views.plans.unsubscribeModal.body") }}
        </p>
        <AppButton class="mt-10" color="primary" @click="onUnsubscribeClick">
          {{ $t("global.unsubscribeButton") }}
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
import gql from "graphql-tag";
import { ContentLoader } from "vue-content-loader";
import {
  getUser,
  createStripeCheckoutSession,
  toast,
  REQUEST_STATE,
} from "@/utils/helpers";

export default {
  components: {
    AppButton,
    AppBreadcrumb,
    AppModal,
    DefaultLayout,
    ContentLoader,
  },
  data() {
    return {
      subscribeRequest: {
        state: REQUEST_STATE.NOT_STARTED,
        planId: null,
      },
      daysFreeTrial: process.env.VUE_APP_DAYS_FREE_TRIAL,
      blog: {},
      blogSet: {},
      plans: [],
      changePlanModal: {
        plan: {},
      },
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
      window._paq.push(["trackEvent", "Checkout", "Subscribe", plan.id]);
      const user = await getUser();
      if (!this.blogSet.subscription.id) {
        this.subscribeRequest.state = REQUEST_STATE.PENDING;
        this.subscribeRequest.planId = plan.id;
        const stripe = Stripe(process.env.VUE_APP_STRIPE_PUBLIC_KEY);
        const sessionId = await createStripeCheckoutSession({
          userEmail: user.email,
          userId: user._id,
          ...(user.customerId && {
            customerId: user.customerId,
          }),
          blogSetId: this.$route.params.blogSetId,
          planId: plan.id,
          successUrl: `${process.env.VUE_APP_BASE_URL}`,
          cancelUrl: `${process.env.VUE_APP_BASE_URL}/blogset/${this.$route.params.blogSetId}/plans`,
        });
        stripe
          .redirectToCheckout({
            sessionId,
          })
          .then(r => {
            this.subscribeRequest.state = REQUEST_STATE.FINISHED_OK;
          })
          .catch(error => {
            this.subscribeRequest.state = REQUEST_STATE.FINISHED_ERROR;
            toast(this, error, "error");
            throw new Error(error);
          });
      } else {
        this.changePlanModal = {
          plan,
        };
        this.$store.commit("modalShowing/open", "changePlanModal");
      }
    },
    changePlan(plan) {
      const subscription = {
        id: this.blogSet.subscription.id,
        planId: plan.id,
      };
      return apolloClient
        .mutate({
          variables: {
            blogSet: {
              _id: this.$route.params.blogSetId,
              subscription,
            },
          },
          mutation: gql`
            mutation($blogSet: UpdateBlogSetInput!) {
              updateBlogSet(blogSet: $blogSet) {
                subscription {
                  id
                  planId
                }
              }
            }
          `,
        })
        .then(() => {
          this.$router
            .push({
              name: "blogSetList",
            })
            .then(() => {
              this.$store.commit("modalShowing/close", "changePlanModal");
              this.$store.commit("modalShowing/open", "paymentSuccessModal");
            });
        });
    },
    onUnsubscribeClick() {
      const subscription = {
        id: this.blogSet.subscription.id,
        planId: this.blogSet.subscription.planId,
        hasToSubscribe: true,
      };
      return apolloClient
        .mutate({
          variables: {
            blogSet: {
              _id: this.$route.params.blogSetId,
              subscription,
            },
          },
          mutation: gql`
            mutation($blogSet: UpdateBlogSetInput!) {
              updateBlogSet(blogSet: $blogSet) {
                subscription {
                  id
                  planId
                  hasToSubscribe
                }
              }
            }
          `,
        })
        .then(() => {
          this.$router
            .push({
              name: "blogSetList",
            })
            .then(() => {
              this.$store.commit("modalShowing/close", "unsubscribeModal");
              this.$store.commit(
                "modalShowing/open",
                "unsubscribeSuccessModal"
              );
            });
        });
    },
    async fetchData() {
      apolloClient
        .query({
          variables: {
            blogSetId: this.$route.params.blogSetId,
          },
          query: gql`
            query blogSet($blogSetId: ID!) {
              blogSet(_id: $blogSetId) {
                _id
                name
                subscription {
                  id
                  planId
                  trialEnd
                  hasToSubscribe
                  plan {
                    id
                    amount
                    productName
                  }
                }
              }
            }
          `,
        })
        .then(result => {
          this.blogSet = result.data.blogSet;
        });

      apolloClient
        .query({
          query: gql`
            query getPlansQuery {
              plans {
                id
                amount
                amountTaxes
                metadata
                productName
              }
            }
          `,
        })
        .then(result => {
          this.plans = result.data.plans;
        });
    },
    isPlanSubscribed(planId) {
      return (
        this.blogSet.subscription &&
        !this.blogSet.subscription.trialEnd &&
        this.blogSet.subscription.planId === planId
      );
    },
  },
};
</script>
