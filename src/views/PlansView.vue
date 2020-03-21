<template>
  <DefaultLayout>
    <div class="container">
      <div class="section">
        <div class="columns has-text-centered">
          <template v-if="prices.length > 0">
            <div class="column" v-for="price in prices" :key="price.planId">
              <div class="box">
                <h2 class="title is-4">{{ price.productName }}</h2>
                <div class="title is-4">
                  {{ price.planAmount / 100 }}$ / month
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
          <template v-if="prices.length === 0">
            <div class="column" v-for="(v, i) in [0, 1, 2, 3]" :key="i">
              <div class="box" style="min-height:250px"></div>
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

export default {
  components: {
    DefaultLayout
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
