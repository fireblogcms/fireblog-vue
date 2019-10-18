<template>
  <div style="box-shadow: 1px 1px 10px 0 rgba(14,30,37,.12);" class="layout-body">
    <slot />
  </div>
</template>

<style scoped>
.layout-body {
  border: solid rgb(230, 230, 230) 1px;
  background: white;
  border-radius: 6px;
  margin: auto;
  padding-top: 20px;
}
</style>