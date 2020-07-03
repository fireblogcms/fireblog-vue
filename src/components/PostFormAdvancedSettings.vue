<template>
  <div>
    <form @submit.prevent>
      <div class="flex flex-col md:flex-row">
        <div class="w-full md:w-1/2 md:mr-3">
          <!-- IMAGE UPLOAD FIELD -->
          <label class="font-bold">
            {{ $t("views.postForm.fields.featuredImage.label") }}
          </label>
          <p class="text-sm italic mb-2">
            {{ $t("views.postForm.fields.featuredImage.help") }}
          </p>
          <S3ImageUpload
            :blogId="$route.params.blogId"
            @onUploadingStateChange="onUploadingStateChange"
            :initialImage="vuexFormGetValue(FORM_ID, 'image')"
            @onUploaded="onUploaded"
          />
        </div>
        <div class="w-full md:w-1/2 md:ml-3 mt-4 md:mt-0">
          <!-- TEASER FIELD -->
          <label class="font-bold">
            {{ $t("views.postForm.fields.teaser.label") }}
          </label>
          <p class="text-sm italic mb-2">
            {{ $t("views.postForm.fields.teaser.help") }}
          </p>
          <!-- limited to 250 because of google, facebook, twitter and co preview card limitation -->
          <AppTextarea
            :value="vuexFormGetValue(FORM_ID, 'teaser')"
            @input="onTeaserInput"
            placeholder="Teaser"
            maxlength="250"
          />

          <!-- SLUG FIELD -->
          <SlugField
            class="mt-4"
            :value="vuexFormGetValue(FORM_ID, 'slug')"
            :error="vuexFormGetError(FORM_ID, 'slug')"
            :showToggleLockButton="
              vuexFormGetValue(FORM_ID, 'slugShowToggleLockButton')
            "
            :locked="vuexFormGetValue(FORM_ID, 'slugIsLocked')"
            @input="onSlugInput"
            @onUnlock="onSlugUnlock"
            @onLock="onSlugLock"
          />
        </div>
      </div>

      <!-- PREVIEW GOOGLE -->
      <p class="mt-16 mb-4 text-2xl font-bold">
        {{ $t("views.postForm.advancedSettingsModal.previewGoogle") }}
      </p>
      <div class="p-6 bg-white shadow-around rounded-lg">
        <PreviewGoogleResult
          :title="vuexFormGetValue(FORM_ID, 'title')"
          :description="vuexFormGetValue(FORM_ID, 'teaser')"
          :url="`https://example.com/post/${vuexFormGetValue(FORM_ID, 'slug')}`"
        />
      </div>
    </form>
  </div>
</template>

<script>
import AppTextarea from "@/ui-kit/AppTextarea";
import S3ImageUpload from "./S3ImageUpload";
import { REQUEST_STATE } from "@/utils/helpers";
import {
  vuexFormGetValue,
  vuexFormGetError,
  vuexFormSetValue,
} from "@/utils/vuexForm";
import SlugField from "./SlugField";
import PreviewGoogleResult from "./PreviewGoogleResult";

const FORM_ID = "postForm";

export default {
  components: {
    AppTextarea,
    PreviewGoogleResult,
    S3ImageUpload,
    SlugField,
  },
  props: {
    existingPost: {
      type: [Object, null],
      default: () => null,
    },
  },
  data() {
    const data = {
      uploadingState: null,
      file: null,
    };
    return data;
  },
  created() {
    this.vuexFormGetError = vuexFormGetError;
    this.vuexFormGetValue = vuexFormGetValue;
    this.FORM_ID = FORM_ID;
  },
  methods: {
    onUploaded(fileUrl) {
      vuexFormSetValue(FORM_ID, "image", fileUrl);
    },
    onTeaserInput(event) {
      vuexFormSetValue(FORM_ID, "teaser", event);
    },
    onSlugInput(event) {
      vuexFormSetValue(FORM_ID, "slug", event);
    },
    onSlugUnlock() {
      vuexFormSetValue(FORM_ID, "slugIsLocked", false);
    },
    onSlugLock() {
      vuexFormSetValue(FORM_ID, "slugIsLocked", true);
    },
    onUploadingStateChange(state) {
      this.uploadingState = state;
      this.$emit("onUploadingStateChange", state);
    },
  },
};
</script>
