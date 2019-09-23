<template>
  <div class="section">
    <div class="content has-text-centered">
      <div class="notification is-danger">
        <slot />
      </div>
      <p>
        <em>This error has been automatically reported to our team.</em>
      </p>
    </div>
  </div>
</template>

<script>
import LayoutBody from "./LayoutBody";
import logger from "../utils/logger";
export default {
  components: {
    LayoutBody
  },
  props: {
    // this is the original JavaScript error. This error is NOT dispayed
    // to the user, it is only sent to the logger.
    error: {
      type: [String, Error],
      required: true
    }
  },
  created() {
    logger.error(this.error);
  }
};
</script>

