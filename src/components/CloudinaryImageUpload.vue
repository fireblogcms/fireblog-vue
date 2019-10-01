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
        <img class="image" height="200px" v-if="displayedImage()" :src="displayedImage()" />
        <span class="file-cta">
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
  props: {
    initialImage: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      uploadProgress: 0,
      uploadedImage: null,
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
          this.uploadedImage = result;
          this.$emit("onUploaded", result);
        })
        .catch(error => {
          new Error(error);
        });
    },
    displayedImage() {
      if (this.uploadedImage) {
        return this.uploadedImage.default;
      } else {
        return this.initialImage;
      }
    }
  }
};
</script>

<style scoped>
.image:hover {
  cursor: pointer;
}
</style>