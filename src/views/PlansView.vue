<template>
  <DefaultLayout>
    <div class="container">
      <div class="section">
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
                  {{ (parseInt(price.planAmount) / 100).toFixed(2) }}$ / month
                </div>
                <p>
                  {{ price.productMetadata.API_CALLS_MONTH }} API calls / month
                </p>
                <hr />
                <button
                  @click="onSubscribeClick(price.planId)"
                  class="button is-primary"
                >
                  Subscribe
                </button>
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

export default {
  components: {
    DefaultLayout,
    ContentLoader
  },
  data() {
    return {
      prices: []
    };
  },
  created() {
    this.fetchData();
  },
  methods: {
    onSubscribeClick(planId) {
      alert("click");
    },
    fetchData() {
      return apolloClient
        .query({
          query: getPricesQuery
        })
        .then(result => {
          this.prices = result.data.prices;
          return result;
        })
        .catch(error => {
          appNotification(
            "Sorry, an error occured while fetching pricing",
            "error"
          );
          throw new Error(error);
        });
    }
  }
};
</script>
