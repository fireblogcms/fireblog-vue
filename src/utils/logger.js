import * as Sentry from "@sentry/browser";
import * as Integrations from "@sentry/integrations";
import Vue from "vue";

// do not catch exceptions during development, because
// we want exception to be displayed in our browser console.
if (process.env.NODE_ENV === "production") {
  Sentry.init({
    dsn: process.env.VUE_APP_SENTRY_URL,
    integrations: [new Integrations.Vue({ Vue, attachProps: true })]
  });
}

export default {
  info() {
    console.log(...arguments);
  },
  error(error) {
    /*
    setTimeout(() => {

      $crisp.push([
        "do",
        "message:show",
        [
          "text",
          "I'm very sory you got an error :-( Can you tell me quickly how it happened to you ?"
        ]
      ]);
    }, 1000);
    */
    if (process.env.NODE_ENV === "production") {
      Sentry.captureException(message);
    } else {
      console.error(error);
    }
  }
};
