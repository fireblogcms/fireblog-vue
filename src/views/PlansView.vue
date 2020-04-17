<template>
  <DefaultLayout>
    <!-- TOPBAR LEFT BUTTONS -->
    <portal to="topbar-left">
      <span class="item tag is-large">
        <router-link class="item" :to="{ name: 'blogList' }">
          <img
            class="is-hidden-mobile"
            style="position:relative;height:20px !important;top:4px;"
            src="/images/books.webp"
          />
          <IconBack />
          {{ $t("views.postList.backToBlogLink") }}
        </router-link>
      </span>
    </portal>
    <!-- END TOPBAR LEFT BUTTONS -->

    <div class="container">
      <div class="section" v-if="freePlan">
        <div class="columns">
          <div class="column is-8 is-offset-2">
            <div class="box box-trial-message">
              <p>
                {{ $t("views.plans.freeTrialFirst") }}
                {{ freePlan.productName }}
                {{ $t("views.plans.freeTrialSecond") }}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div class="section">
        <h1 class="title is-1 has-text-centered is-uppercase">
          {{ $t("views.plans.title") }}
        </h1>
        <div class="features has-text-centered">
          <p class="has-text-weight-bold">
            {{ $t("views.plans.introduction") }}
          </p>
          <p>✔️ {{ $t("views.plans.webhooks") }}</p>
          <p>✔️ {{ $t("views.plans.editor") }}</p>
          <p>
            ✔️ {{ $t("views.plans.gatsbyFirst") }}
            <a
              target="_blank"
              href="https://github.com/fireblogcms/gatsby-starter-fireblog"
              >Gatsby starter theme</a
            >
            {{ $t("views.plans.gatsbySecond") }}
          </p>
        </div>
        <div class="columns has-text-centered">
          <template v-if="plans.length > 0">
            <div class="column" v-for="plan in plans" :key="plan.id">
              <div
                class="box"
                :class="{
                  'box-subscribed-plan': isPlanSubscribed(plan.id)
                }"
              >
                <h2 class="title is-4">{{ plan.productName }}</h2>
                <p class="title is-6 has-text-weight-bold">
                  {{ $t(plan.metadata.SUBTITLE) }}
                </p>
                <p class="title is-4">
                  {{ (parseInt(plan.amountTaxes) / 100).toFixed(2) }}
                  {{ $t("views.plans.eurosPerMonth") }}
                </p>
                <p class="has-text-weight-bold">
                  {{ $t("views.plans.includes") }}
                </p>
                <p>
                  {{ plan.metadata.API_CALLS_MONTH }}
                  {{ $t("views.plans.apiCalls") }}
                </p>
                <p>
                  {{ plan.metadata.STORAGE_GB }} 
                  {{ $t("views.plans.storageUnitGB") }} 
                  {{ $t("views.plans.storage") }}
                </p>
                <button
                  @click="onSubscribeClick(plan)"
                  class="button is-primary button-subscribe"
                  v-if="isChangePlanAvailable && !isPlanSubscribed(plan.id)"
                >
                  {{ $t("global.subscribeButton") }}
                </button>
                <button
                  @click="onContactUsClick()"
                  class="button is-primary button-subscribe"
                  v-if="!isChangePlanAvailable && !isPlanSubscribed(plan.id)"
                >
                  {{ $t("global.contactUsButton") }}
                </button>
              </div>
            </div>
          </template>
          <!-- loading placeholder -->
          <template v-if="plans.length === 0">
            <div class="column" v-for="(v, i) in [0, 1, 2, 3]" :key="i">
              <div class="box">
                <ContentLoader :height="350">
                  <rect x="0" y="0" rx="3" ry="3" width="100%" height="60" />
                  <rect x="0" y="80" rx="3" ry="3" width="100%" height="30" />
                  <rect x="0" y="140" rx="3" ry="3" width="100%" height="30" />
                </ContentLoader>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <ChangePlanModal
      :show="changePlanModal.show"
      :plan="changePlanModal.plan"
      @changePlan="changePlan"
    />
  </DefaultLayout>
</template>

<script>
import DefaultLayout from "../layouts/DefaultLayout";
import IconBack from "../components/IconBack";
import ChangePlanModal from "../components/ChangePlanModal";
import apolloClient from "../utils/apolloClient";
import {
  getPlansQuery,
  updateBlogMutation
} from "../utils/queries";
import { ContentLoader } from "vue-content-loader";
import {
  getBlog,
  getUser,
  getPlan,
  createStripeCheckoutSession,
  toast
} from "../utils/helpers";

export default {
  components: {
    IconBack,
    DefaultLayout,
    ContentLoader,
    ChangePlanModal
  },
  data() {
    return {
      blog: {},
      freePlan: null,
      plans: [],
      changePlanModal: {
        show: false,
        plan: {}
      },
      isChangePlanAvailable:
        process.env.VUE_APP_CHANGE_PLAN_AVAILABLE === "true"
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
            console.log(r);
          })
          .catch(error => {
            console.log(error);
            toast(this, error, "error");
            throw new Error(error);
          });
      } else {
        this.changePlanModal = {
          show: true,
          plan
        };
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
          this.blog.subscription.planId = result.data.updateBlog.subscription.planId;
          this.changePlanModal.show = false;
          return result.data.updateBlog;
        })
        .catch(error => {
          toast(this, error, "error");
          throw new Error(error);
        });
    },
    onContactUsClick() {
      $crisp.push(["do", "chat:open"]);
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

<style lang="scss" scoped>
.features {
  margin-bottom: 3rem;
}
.box {
  height: 100%;
  border: 5px solid transparent;
}
.box-trial-message {
  text-align: center;
}
.box-subscribed-plan {
  border-color: $primary;
}
.button-subscribe {
  margin-top: 2rem;
}
</style>
