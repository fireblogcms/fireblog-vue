<template>
  <div>
    <portal v-if="errors && errors.length > 0" to="notifications">
      <div class="notification is-danger has-text-centered">
        <div v-for="(error, i) in errors" :key="i">{{error}}</div>
      </div>
    </portal>
  </div>
</template>

<script>
export default {
  props: {
    errors: {
      type: Array,
      default: () => []
    },
    info: {
      type: Array,
      default: () => []
    }
  }
};
</script>
