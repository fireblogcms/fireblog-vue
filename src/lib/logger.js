import * as Sentry from "@sentry/browser";
import * as Integrations from "@sentry/integrations";
import Vue from "vue";

Sentry.init({
  dsn: process.env.VUE_APP_SENTRY_URL,
  integrations: [new Integrations.Vue({ Vue, attachProps: true })]
});

export default {
  info() {
    console.log(...arguments);
  },
  error(message) {
    Sentry.captureException(message);
  }
};
