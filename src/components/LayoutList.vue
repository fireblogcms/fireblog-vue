<template>
  <div class="layout-list">
    <div
      @click="onRowClick(item)"
      class="row"
      v-for="(item, index) in items"
      :key="itemUniqueKey(item, index)"
    >
      <slot :item="item" :index="index"></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    items: {
      type: Array,
      default: () => []
    },
    itemUniqueKey: {
      type: Function,
      default: (item, index) => index
    },
    onRowClick: {
      type: Function,
      default: () => {}
    }
  }
};
</script>

<style scoped>
.layout-list .row {
  padding: 0px 20px;
  cursor: pointer;
}

.layout-list .row:hover {
  background: rgb(253, 253, 253);
}
</style>