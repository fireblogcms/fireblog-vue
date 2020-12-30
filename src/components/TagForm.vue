<template>
  <div>
    Tag form
    <pre>
    {{ tag }}
    </pre>
  </div>
</template>

<script>
export default {
  props: {
    tag: {
      type: [Object, null],
    },
  },
};
</script>
