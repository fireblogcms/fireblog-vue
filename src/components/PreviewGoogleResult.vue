<template>
  <div class="google-preview">
    <div class="google-preview__url">
      {{ computedUrl }}
    </div>
    <div class="google-preview__title">
      {{ title }}
    </div>
    <div class="google-preview__description">{{ computedDescription }}</div>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    }
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
    }
  }
};
</script>

<style scoped>
.google-preview {
  max-width: 600px;
}
.google-preview__url {
  font-size: 14px;
  padding-top: 1px;
  line-height: 1.3;
  color: #3c4043;
}
.google-preview__title {
  font-size: 20px;
  line-height: 1.3;
  padding-top: 4px;
  color: rgb(26, 13, 171);
}
.google-preview__description {
  line-height: 1.57;
  word-wrap: break-word;
  color: rgb(60, 64, 67);
  font-size: 14px;
}
</style>