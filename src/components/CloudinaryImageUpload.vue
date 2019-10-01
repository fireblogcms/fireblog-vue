<template>
  <div>
    <div v-show="uploadProgress > 0 && uploadProgress < 100">
      <progress
        style="border-radius:0"
        class="progress is-primary"
        :value="uploadProgress"
        max="100"
      >{{uploadProgress}}</progress>
    </div>
    <div class="file is-large is-boxed has-name">
      <label style="width:100%" class="file-label">
        <input class="file-input" type="file" @change="processImage($event)" name="resume" />
        <img class="image" height="200px" v-if="image && image.default" :src="image.default" />
        <span v-show="!image" class="file-cta">
          <span class="file-icon">
            <img src="/images/icon-upload.svg" />
          </span>
          <span class="file-label">Upload image</span>
        </span>
        <span v-if="this.file && false" class="file-name">{{this.file.name}}</span>
      </label>
    </div>
  </div>
</template>

<script>
import {
  cloudinaryUploadImage,
  getCloudinaryBlogFolderPath
} from "../utils/helpers";
export default {
  data() {
    return {
      uploadProgress: 0,
      image: null,
      file: null
    };
  },
  methods: {
    processImage(event) {
      this.file = event.target.files[0];
      cloudinaryUploadImage({
        file: this.file,
        folder: getCloudinaryBlogFolderPath(this.$route.params.blogId),
        options: {
          onProgress: ({ total, loaded, percentage }) => {
            this.$emit("onProgress", { total, loaded, percentage });
            this.uploadProgress = percentage;
          }
        }
      })
        .then(result => {
          this.image = result;
          this.$emit("onUploaded", result);
        })
        .catch(error => {
          new Error(error);
        });
    }
  }
};
</script>

<style scoped>
.image:hover {
  cursor: pointer;
}
</style>