<template>
  <div class="flex flex-col items-center">
    <img v-if="uploadedImage" :src="uploadedImage" />
    <img v-if="!uploadedImage" :src="initialImage" />

    <progress
      v-show="uploadingState === 'PENDING'"
      class="w-64"
      :value="uploadProgress"
      max="100"
    >
      {{ uploadProgress }}
    </progress>

    <label class="mt-6 cursor-pointer">
      <input
        class="hidden"
        type="file"
        accept="image/*"
        @change="processImage($event)"
        name="file"
      />
      <div
        class="flex items-center border-2 rounded-md bg-white border-gray-200 py-3 px-6 text-2xl"
      >
        <img class="w-6 mr-4" src="/images/icon-upload.svg" />
        <span>
          {{ $t("global.chooseFile") }}
        </span>
      </div>
    </label>

    <p v-if="file" class="text-sm">
      {{ file.name }}
    </p>
  </div>
</template>

<script>
import { REQUEST_STATE, S3Upload } from "@/utils/helpers";

export default {
  props: {
    blogId: {
      type: String,
      required: true,
    },
    initialImage: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      uploadProgress: 0,
      uploadedImage: null,
      file: null,
      uploadingState: REQUEST_STATE.NOT_STARTED,
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
          percentage,
        });
      };

      return S3Upload({
        blogId: this.blogId,
        file: this.file,
        onProgress,
      })
        .then(({ fileUrl, uploadPolicy }) => {
          this.uploadingState = REQUEST_STATE.FINISHED_OK;
          this.$emit("onUploadingStateChange", this.uploadingState);
          this.uploadedImage = fileUrl;
          this.$emit("onUploaded", fileUrl);
        })
        .catch(error => {
          this.uploadingState = REQUEST_STATE.FINISHED_ERROR;
          appNotifcation("error", error);
          this.$emit("onUploadingStateChange", this.uploadingState);
        });
    },
  },
};
</script>
