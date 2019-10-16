<template>
  <div class="cloudinary-image-direct-upload">
    <img
      v-if="displayImageWhenUploaded && uploadingState !== 'PENDING'"
      class="image"
      :src="displayedImage()"
    />
    <div v-show="uploadingState === 'PENDING'">
      <progress
        style="border-radius:0"
        class="progress is-primary"
        :value="uploadProgress"
        max="100"
      >{{uploadProgress}}</progress>
    </div>
    <div class="file is-large is-boxed has-name is-centered">
      <label class="file-label" style="width: 100%">
        <input class="file-input" type="file" @change="processImage($event)" name="resume" />
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
  getCloudinaryBlogFolderPath,
  REQUEST_STATE
} from "../utils/helpers";
export default {
  props: {
    displayImageWhenUploaded: {
      type: Boolean,
      default: false
    },
    initialImage: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      uploadProgress: 0,
      uploadedImage: null,
      file: null,
      errorMessage: null,
      uploadingState: REQUEST_STATE.NOT_STARTED
    };
  },
  methods: {
    processImage(event) {
      this.file = event.target.files[0];
      this.uploadingState = REQUEST_STATE.PENDING;
      this.$emit("onUploadingStateChange", this.uploadingState);
      this.errorMessage = null;
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
          this.uploadingState = REQUEST_STATE.FINISHED_OK;
          this.$emit("onUploadingStateChange", this.uploadingState);
          this.uploadedImage = result;
          this.$emit("onUploaded", result);
        })
        .catch(error => {
          this.errorMessage = error;
          this.uploadingState = REQUEST_STATE.FINISHED_ERROR;
          this.$emit("onUploadingStateChange", this.uploadingState);
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
.file-icon img {
  color: white;
}
</style>

