<template>
  <div class="section container">
    <LayoutBody class="has-text-centered">
      <div class="content">
        <slot />
        <div>
          <em>Error has been automatically reported to our team.</em>
          <div>
            détails:
            <br />
            <pre>{{error}}</pre>
          </div>
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

