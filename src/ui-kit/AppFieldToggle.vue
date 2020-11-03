<template>
  <label class="switch relative inline-block">
    <input
      type="checkbox"
      class="opacity-0 w-0 h-0"
      :checked="checked"
      @change="$emit('change', $event.target.checked)"
    >
    <span class="slider absolute inset-0 duration-500 bg-gray-300 rounded-full cursor-pointer"></span>
  </label>
</template>

<script>
export default {
  props: {
    checked: {
      type: Boolean,
      default: false,
    },
  }
}
</script>

<style scoped>
.switch {
  width: 58px;
  height: 32px;
}
.slider:before {
  position: absolute;
  content: "";
  height: 25px;
  width: 25px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  border-radius: 100%;
  transition: .5s;
}
input:checked + .slider {
  background-color: #735cd9;
}
input:focus + .slider {
  box-shadow: 0 0 1px #735cd9;
}
input:checked + .slider:before {
  transform: translateX(25px);
}
</style>
