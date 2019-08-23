<template>
  <div class="layout-body">
    <slot />
  </div>
</template>

<style scoped>
.layout-body {
  border: solid rgb(230, 230, 230) 1px;
  background: white;
  border-radius: 10px;
  margin: 0 0 60px 0;
  padding-top: 20px;
}
</style>