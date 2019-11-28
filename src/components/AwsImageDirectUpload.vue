<template>
  <div class="cloudinary-image-direct-upload">
    <img v-if="uploadedImage" class="image" :src="uploadedImage" />

    <div v-show="uploadingState === 'PENDING'">
      <progress
        style="border-radius:0"
        class="progress is-primary"
        :value="uploadProgress"
        max="100"
        >{{ uploadProgress }}</progress
      >
    </div>
    <div class="file is-large is-boxed has-name is-centered">
      <label class="file-label" style="width: 100%">
        <input
          class="file-input"
          type="file"
          @change="processImage($event)"
          name="resume"
        />
        <span class="file-cta">
          <span class="file-icon">
            <img src="/images/icon-upload.svg" />
          </span>
          <span class="file-label">Upload image</span>
        </span>
        <span v-if="this.file && false" class="file-name">{{
          this.file.name
        }}</span>
      </label>
    </div>
  </div>
</template>

<script>
import { REQUEST_STATE, S3GenerateUploadPolicy } from "../utils/helpers";

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
      file: null,
      errorMessage: null,
      uploadingState: REQUEST_STATE.NOT_STARTED
    };
  },
  methods: {
    processImage(event) {
      this.file = event.target.files[0];
      return S3GenerateUploadPolicy(this.file.name)
        .then(policy => {
          this.uploadProgress = 0;
          this.uploadingState = REQUEST_STATE.PENDING;
          const formData = new FormData();

          Object.keys(policy.fields).forEach(key => {
            formData.append(key, policy.fields[key]);
          });
          // Actual file has to be appended last.
          formData.append("file", this.file);

          const xhr = new XMLHttpRequest();
          xhr.open("POST", policy.uploadUrl, true);

          xhr.upload.onprogress = event => {
            const percentage = (event.loaded / event.total) * 100;
            this.uploadProgress = percentage;
            this.$emit("onProgress", {
              total: event.total,
              loaded: event.loaded,
              percentage
            });
          };

          xhr.onload = () => {
            this.uploadingState = REQUEST_STATE.FINISHED_OK;
            this.$emit("onUploadingStateChange", this.uploadingState);
            this.uploadedImage = policy.fileUrl;
            this.$emit("onUploaded", policy.fileUrl);
          };

          xhr.onerror = result => {
            this.uploadingState = REQUEST_STATE.FINISHED_ERROR;
            this.$emit("onUploadingStateChange", this.uploadingState);
          };

          xhr.send(formData);
        })
        .catch(e => {
          console.log("e", e);
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
