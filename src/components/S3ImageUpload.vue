<template>
  <div
    id="image-upload-widget"
    class="flex flex-col items-center rounded relative rounded pb-6"
    :class="{ 'bg-gray-100': !uploadedImage }"
  >
    <img v-if="uploadedImage" :src="uploadedImage" />
    <img v-if="!uploadedImage" :src="initialImage" />

    <!--
    <progress
      v-show="uploadingState === 'PENDING'"
      class="w-full bg-indigo-300"
      :value="uploadProgress"
      max="100"
    >
      {{ uploadProgress }}
    </progress>
    -->

    <label class="mt-6 cursor-pointer">
      <input
        class="hidden"
        type="file"
        accept="image/*"
        @change="processImage($event)"
        name="file"
      />
      <div class="border-2 rounded-md bg-white border-gray-200 relative">
        <div class="flex py-3 px-6 items-center text-2xl">
          <img width="50" src="/images/upload-image-placeholder.png" />
          <span>
            {{ $t("global.uploadImage") }}
          </span>
        </div>
      </div>
      <div class="pt-1 w-full" v-show="uploadingState === 'PENDING'">
        <div class="overflow-hidden h-4 text-xs flex rounded bg-indigo-200">
          <div
            :style="`width: ${uploadProgress}%`"
            class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
          ></div>
        </div>
      </div>
    </label>

    <!--
    <p v-if="file" class="text-sm">
      {{ file.name }}
    </p>
    -->
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
