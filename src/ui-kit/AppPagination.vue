<template>
  <nav class=" px-4 flex items-center justify-between sm:px-0">
    <div class="mx-auto">
      <router-link
        v-for="i in pagesNumber"
        :key="i"
        :to="{ name: 'postList', query: { page: i } }"
        :class="{ 'border-t-2 border-indigo-500': i === activePage }"
        class="border-t-2 border-transparent pt-4 px-4 inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
      >
        {{ i }}
      </router-link>
    </div>
  </nav>
</template>

<script>
export default {
  props: {
    routeName: {
      type: String,
      required: true,
    },
    itemsTotal: {
      type: Number,
      required: true,
    },
    itemsPerPage: {
      type: Number,
      required: true,
    },
  },
  computed: {
    pagesNumber() {
      console.log("pagesNumber", this.itemsTotal, this.itemsPerPage);
      return Math.ceil(this.itemsTotal / this.itemsPerPage);
    },
    activePage() {
      return this.$route.params.page ? parseInt(this.$route.params.page) : 1;
    },
  },
};
</script>

<style scoped>
.pagination {
  padding-left: 0;
}
.pagination li {
  display: inline;
}
.pagination li a {
  background: rgb(240, 240, 240);
  padding: 5px 10px;
  margin: 4px;
}
</style>
