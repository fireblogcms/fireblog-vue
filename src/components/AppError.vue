<template>
  <portal to="notifications">
    <div class="container notification is-danger has-text-centered">
      {{humanError}}
      <p>
        <em>
          This error has been automatically reported to our team.
          <span
            v-if="NODE_ENV === 'development'"
            style="text-decoration:underline;cursor:pointer"
            @click="showDetails = !showDetails"
          >{{showDetails ? "Hide details" : "Show details"}}</span>
        </em>
        <div v-if="NODE_ENV === 'development'" v-show="showDetails === true">
          {{machineError}}
          <em>This detailed error is visible only in dev mode.</em>
        </div>
      </p>

      <div v-if="NODE_ENV === 'development'"></div>
    </div>
  </portal>
</template>

<script>
import logger from "../utils/logger";
export default {
  props: {
    // this is the original JavaScript error. This error is NOT dispayed
    // to the user, it is only sent to the logger.
    machineError: {
      type: [String, Error],
      required: true
    },
    humanError: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      showDetails: false
    };
  },
  created() {
    this.NODE_ENV = process.env.NODE_ENV;
    // send automatically error to Sentry
    logger.error(this.machineError);
  }
};
</script>


