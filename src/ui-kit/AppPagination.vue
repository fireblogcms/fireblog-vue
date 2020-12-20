<template>
  <nav
    class="flex items-center justify-between sm:px-0"
    v-show="pagesNumber > 1"
  >
    <div class="mx-auto">
      <router-link
        v-for="i in pagesNumber"
        :key="i"
        :to="{ name: 'postList', query: { ...$route.query, page: i } }"
        :class="{
          'border-t-2 bg-indigo-500 text-white': i === activePage,
          'text-gray-500 hover:text-gray-700': i !== activePage,
        }"
        class="border-t-2 border-transparent py-2 rounded px-4 inline-flex items-center"
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
      return Math.ceil(this.itemsTotal / this.itemsPerPage);
    },
    activePage() {
      return this.$route.query.page ? parseInt(this.$route.query.page) : 1;
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
