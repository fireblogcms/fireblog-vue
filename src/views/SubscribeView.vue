<template>
  <DefaultLayout>
    <div class="container">
      <div class="columns has-text-centered">
        <div class="column" v-for="price in prices" :key="price.planId">
          <div class="box">
            <h1 class="title is-4">{{ price.productName }}</h1>
            <h1 class="subtitle is-4">{{ price.planAmount / 100 }}</h1>
            <button
              @click="onSubscribeClick(price.planId)"
              class="button is-primary"
            >
              Subscribe
            </button>
          </div>
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
