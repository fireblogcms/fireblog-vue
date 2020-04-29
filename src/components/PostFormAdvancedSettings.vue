<template>
  <div>
    <form @submit.prevent>
      <div class="columns">
        <div class="column">
          <!-- IMAGE UPLOAD FIELD -->
          <div class="field featured-image">
            <div class="label-wrapper">
              <label>
                <strong>{{
                  $t("views.postForm.fields.featuredImage.label")
                }}</strong>
              </label>
              <p class="help">
                {{ $t("views.postForm.fields.featuredImage.help") }}
              </p>
            </div>
            <S3ImageUpload
              :blogId="$route.params.blogId"
              @onUploadingStateChange="onUploadingStateChange"
              :initialImage="vuexFormGetValue(FORM_ID, 'image')"
              @onUploaded="onUploaded"
            />
          </div>
        </div>
        <div class="column">
          <!-- TEASER FIELD -->
          <div class="field">
            <div class="label-wrapper">
              <label>
                <strong>{{ $t("views.postForm.fields.teaser.label") }}</strong>
                <p class="help">
                  {{ $t("views.postForm.fields.teaser.help") }}
                </p>
              </label>
            </div>
            <div class="control">
              <!-- limited to 250 because of google, facebook, twitter and co preview card limitation -->
              <textarea
                maxlength="250"
                @input="onTeaserInput"
                :value="vuexFormGetValue(FORM_ID, 'teaser')"
                class="textarea is-medium"
                :class="{ 'is-danger': vuexFormGetError(FORM_ID, 'teaser') }"
                placeholder="Teaser"
              ></textarea>
            </div>
          </div>

          <SlugField
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
      <hr />
      <div class="columns">
        <div class="column">
          <h3 class="title is-4">Preview Google result</h3>
          <div class="box">
            <PreviewGoogleResult
              :title="vuexFormGetValue(FORM_ID, 'title')"
              :description="vuexFormGetValue(FORM_ID, 'teaser')"
              :url="
                `https://example.com/post/${vuexFormGetValue(FORM_ID, 'slug')}`
              "
            />
          </div>
        </div>
      </div>
    </form>
    <!-- debug form values -->
    <pre v-if="false">{{ $store.state.forms.postForm }}</pre>
  </div>
</template>

<script>
import S3ImageUpload from "./S3ImageUpload";
import { REQUEST_STATE } from "@/utils/helpers";
import {
  vuexFormGetValue,
  vuexFormGetError,
  vuexFormSetValue
} from "@/utils/vuexForm";
import SlugField from "./SlugField";
import PreviewGoogleResult from "./PreviewGoogleResult";

const FORM_ID = "postForm";

export default {
  components: {
    PreviewGoogleResult,
    S3ImageUpload,
    SlugField
  },
  props: {
    existingPost: {
      type: [Object, null],
      default: () => null
    }
  },
  data() {
    const data = {
      uploadingState: null,
      file: null
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
      vuexFormSetValue(FORM_ID, "teaser", event.target.value);
    },
    onSlugInput({ source, slug }) {
      vuexFormSetValue(FORM_ID, "slug", slug);
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
    }
  }
};
</script>

<style scoped>
.label {
  padding-bottom: 0px;
}
.field-help {
  font-weight: 100;
  font-size: 15px;
  font-style: italic;
}
.actions {
  display: flex;
  justify-content: center;
}

.post-preview-help {
  max-width: 500px;
}
.post-preview-wrapper {
  max-width: 500px;
}
.post-preview {
  margin-top: 10px;
  margin: 20px auto;
  border-radius: 3px;
  border: 1px solid #dedede;
  box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.06);
}

.post-preview-image {
  background-position: center center;
  background-repeat: no-repeat;
  background-size: cover;
  height: 260px;
  overflow: hidden;
}

.post-preview-content {
  padding: 10px;
}
</style>
