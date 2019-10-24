<template>
  <RouterLink :to="to" class="btn_hover" :class="classes">
    <slot>Click Me</slot>
  </RouterLink>
</template>

<script>
export default {
  props: {
    to: {
      // router link, as an object. example : {name: 'PodCreate'}
      type: Object,
      required: true,
    },
    type: {
      type: String,
      default: 'primary',
    },
  },
  computed: {
    classes() {
      return {
        'btn_get seo_btn': this.type === 'primary',
        btn_get: this.type === 'secondary',
      };
    },
  },
};
</script>

<style scoped>
/*
.btn_hover {
  overflow: hidden;
  display: inline-block;
  font-weight: 500;
  z-index: 1;
  cursor: pointer;
  transition: all 0.3s linear;
}
*/

.btn_get {
  font-weight: 500;
  font-size: 20px;
  color: #6754e2;
  border: 2px solid rgb(204, 197, 250);
  border-radius: 4px;
  box-shadow: 0px 20px 24px 0px rgba(0, 11, 40, 0.1);
  padding: 10px 23px;
  transform: perspective(1px) translateZ(0);
  transition-property: color;
  transition: all 0.3s ease;
  min-width: 120px;
  text-align: center;
}

.btn_get:hover {
  color: #fff;
  background: #6754e2;
  border-color: #6754e2;
  box-shadow: none;
}

.seo_btn {
  color: #5e2ced;
  background: #e8e1fc;
  display: inline-block;
  padding: 11px 40px;
  border-radius: 4px;
}
</style>
