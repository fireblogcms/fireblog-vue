<template>
  <div class="cloudinary-image-direct-upload">
    <img v-if="uploadedImage" class="image" :src="uploadedImage" />
    <img v-if="!uploadedImage" class="image" :src="initialImage" />

    <div v-show="uploadingState === 'PENDING'">
      <progress
        style="border-radius:0"
        class="progress is-primary"
        :value="uploadProgress"
        max="100"
      >{{ uploadProgress }}</progress>
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
        <span v-if="this.file && false" class="file-name">
          {{
          this.file.name
          }}
        </span>
      </label>
    </div>
  </div>
</template>

<script>
import { REQUEST_STATE, S3Upload } from "../utils/helpers";

export default {
  props: {
    blogId: {
      type: String,
      required: true
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
      this.uploadingState = REQUEST_STATE.PENDING;
      this.$emit("onUploadingStateChange", this.uploadingState);
      this.file = event.target.files[0];
      this.uploadProgress = 0;
      const onProgress = ({ loaded, total, percentage }) => {
        this.uploadProgress = percentage;
        this.$emit("onProgress", {
          total: event.total,
          loaded: event.loaded,
          percentage
        });
      };

      return S3Upload({
        blogId: this.blogId,
        file: this.file,
        onProgress
      })
        .then(({ fileUrl, uploadPolicy }) => {
          this.uploadingState = REQUEST_STATE.FINISHED_OK;
          this.$emit("onUploadingStateChange", this.uploadingState);
          this.uploadedImage = fileUrl;
          this.$emit("onUploaded", fileUrl);
        })
        .catch(error => {
          this.uploadingState = REQUEST_STATE.FINISHED_ERROR;
          this.$emit("onUploadingStateChange", this.uploadingState);
        });
    }
  }
};
</script>

<style scoped>
.file-icon img {
  color: white;
}
</style>
