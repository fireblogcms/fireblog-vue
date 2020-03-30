<template>
  <DefaultLayout>
    <div class="container">
      <div class="section">
        <h1 class="title is-1 has-text-centered">SUBSCRIPTIONS</h1>
        <div style="margin-bottom:40px" class="feature has-text-centered">
          <p>
            <strong>All our plans includes following features: </strong> <br />
            ✔️ Webhooks : rebuild automatically your JAMstack blog or site !
            <br />
            ✔️ A minimalist & powerful editor dedicated to long writing sessions
            <br />
            ✔️ A free and SEO-friendly
            <a
              target="_blank"
              href="https://github.com/fireblogcms/gatsby-starter-fireblog"
              >Gatsby stater theme</a
            >
            made with 💛to boost your SEO
          </p>
        </div>
        <div class="columns has-text-centered">
          <template v-if="prices.length > 0">
            <div class="column" v-for="price in prices" :key="price.planId">
              <div class="box">
                <h2 class="title is-4">{{ price.productName }}</h2>
                <div class="title is-6">
                  <em>{{ price.productMetadata.SUBTITLE }}</em>
                </div>
                <br />
                <div class="title is-4">
                  {{ (parseInt(price.planAmount) / 100).toFixed(2) }} EUR / month
                </div>
                <p>
                  <strong>includes</strong> <br />{{
                    price.productMetadata.API_CALLS_MONTH
                  }}
                  API calls / month <br />
                  <span style="position:relative;top:1px;">➕</span>
                  {{ price.productMetadata.STORAGE_GO }} Go Storage space
                </p>
                <template v-if="subscribedPlanId !== price.planId">
                  <hr />
                  <button
                    @click="onSubscribeClick(price.planId)"
                    class="button is-primary"
                  >
                    Subscribe
                  </button>
                </template>
              </div>
            </div>
          </template>
          <!-- loading placeholder -->
          <template v-if="prices.length === 0">
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
  </DefaultLayout>
</template>

<script>
import DefaultLayout from "../layouts/DefaultLayout";
import apolloClient from "../utils/apolloClient";
import { getPricesQuery } from "../utils/queries";
import { ContentLoader } from "vue-content-loader";
import {
  getBlog,
  getUser,
  createStripeCheckoutSession,
  toast
} from "../utils/helpers";

const features = [
  "Webhooks : rebuild your JAMstack blog or site !",
  "A simple editor dedicated to writing",
  "A free and SEO-friendly Gatsby stater theme"
];

export default {
  components: {
    DefaultLayout,
    ContentLoader
  },
  data() {
    return {
      prices: [],
      subscribedPlanId: null
    };
  },
  created() {
    this.fetchData();
    this.features = features;
  },
  mounted() {
    let stripeScript = document.createElement("script");
    stripeScript.setAttribute("src", "https://js.stripe.com/v3/");
    document.head.appendChild(stripeScript);
  },
  methods: {
    async onSubscribeClick(planId) {
      const user = await getUser();
      const stripe = Stripe(process.env.VUE_APP_STRIPE_PUBLIC_KEY);
      const sessionId = await createStripeCheckoutSession({
        userId: user._id,
        userEmail: user.email,
        blogId: this.$route.params.blogId,
        planId,
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
    },
    async fetchData() {
      const blog = await getBlog(this.$route.params.blogId);
      this.subscribedPlanId = blog.subscription;
      return apolloClient
        .query({
          query: getPricesQuery
        })
        .then(result => {
          this.prices = result.data.prices;
          console.log("PRICES", this.prices);
          return result;
        })
        .catch(error => {
          toast(this, "Sorry, an error occured while fetching pricing", "error");
          throw new Error(error);
        });
    }
  }
};
</script>
