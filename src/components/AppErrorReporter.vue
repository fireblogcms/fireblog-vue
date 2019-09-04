<template>
  <div class="section container">
    <LayoutBody class="has-text-centered">
      <div class="content section">
        <slot />
        <div>
          <p>
            <em>This error has been automatically reported to our team.</em>
          </p>
          <div class="notification is-danger">{{error}}</div>
        </div>
      </div>
    </LayoutBody>
  </div>
</template>

<script>
import LayoutBody from "./LayoutBody";
import logger from "../lib/logger";
export default {
  components: {
    LayoutBody
  },
  props: {
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

