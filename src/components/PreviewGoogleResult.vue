<template>
  <div>
    <p class="text-sm">
      {{ computedUrl }}
    </p>
    <p class="pt-2 text-xl text-indigo-700">
      {{ computedTitle }}
    </p>
    <p class="text-sm">
      {{ computedDescription }}
    </p>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  computed: {
    computedUrl() {
      let fullUrl = this.url
        .replace("https://", "")
        .split("/")
        .join(" › ");

      let urlShortened = fullUrl.slice(0, 70);
      if (fullUrl.length > urlShortened.length) {
        urlShortened += "...";
      }
      return urlShortened;
    },
    computedDescription() {
      let descriptionShortened = this.description.substr(0, 150);
      if (this.description.length > descriptionShortened.length) {
        descriptionShortened += "...";
      }
      return descriptionShortened;
    },
    computedTitle() {
      let titleShortened = this.title.substr(0, 60);
      if (this.title.length > titleShortened.length) {
        titleShortened += "...";
      }
      return titleShortened;
    },
  },
};
</script>
