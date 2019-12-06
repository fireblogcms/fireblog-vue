<template>
  <div class="root container">
    <form @submit.prevent>
      <div class="columns">
        <div class="column">
          <!-- IMAGE UPLOAD FIELD -->
          <div class="field featured-image">
            <label>
              <strong>
                {{
                $t("views.postForm.fields.featuredImage.label")
                }}
              </strong>
            </label>
            <S3ImageUpload
              :blogId="$route.params.blogId"
              @onUploadingStateChange="onUploadingStateChange"
              :initialImage="formStorageGetValue('postForm', 'image')"
              @onUploaded="onUploaded"
            />
          </div>
        </div>
        <div class="column">
          <!-- TEASER FIELD -->
          <div class="field">
            <label>
              <strong>{{ $t("views.postForm.fields.teaser.label") }}</strong>
              <div class="field-help">{{ $t("views.postForm.fields.teaser.help") }}</div>
            </label>
            <div class="control">
              <!-- limited to 250 because of google, facebook, twitter and co preview card limitation -->
              <textarea
                maxlength="250"
                @input="onTeaserInput"
                :value="formStorageGetValue('postForm', 'teaser')"
                class="textarea is-medium"
                placeholder="Teaser"
              ></textarea>
            </div>
          </div>
          <!-- SLUG FIELD -->
          <div class="field">
            <label>
              <strong>{{ $t("views.postForm.fields.slug.label") }}</strong>
              <div class="field-help">{{ $t("views.postForm.fields.slug.help") }}</div>
            </label>

            <div class="control">
              <input
                @input="onSlugInput"
                :value="formStorageGetValue('postForm', 'slug')"
                class="input is-medium"
                type="text"
                placeholder="slug"
              />
            </div>
            <p
              class="help is-danger"
              v-if="formStorageGetError('postForm', 'slug')"
            >{{ formStorageGetError("postForm", "slug") }}</p>
          </div>
        </div>
        <!--
        <div class="column">
          <div class="post-preview-wrapper">
            <div class="field-help">
              <label class="label">{{ $t("views.postForm.previews.general.name") }}</label>
              {{ $t("views.postForm.previews.general.description") }}
            </div>
            <div class="post-preview">
              <div
                v-if="this.form.values.current.image"
                class="post-preview-image"
                :style="{
                  backgroundImage: `url(${this.form.values.current.image})`
                }"
              ></div>
              <div class="post-preview-content">
                <div>
                  <strong>{{ form.values.current.title }}</strong>
                </div>
                <div class="content">{{ form.values.current.teaser }}</div>
              </div>
            </div>
          </div>
        </div>-->
      </div>
    </form>
    <!-- debug form values -->
    <pre v-if="false">{{ $store.state.forms.postForm }}</pre>
  </div>
</template>

<script>
import S3ImageUpload from "./S3ImageUpload";
import {
  REQUEST_STATE,
  formStorageGetValue,
  formStorageGetError,
  formStorageUpdate
} from "../utils/helpers";

export default {
  components: {
    S3ImageUpload
  },
  data() {
    const data = {
      uploadingState: null,
      file: null
    };
    return data;
  },
  created() {
    this.formStorageGetError = formStorageGetError;
    this.formStorageGetValue = formStorageGetValue;
  },
  methods: {
    onUploaded(fileUrl) {
      formStorageUpdate("postForm", {
        type: "current",
        name: "image",
        value: fileUrl
      });
    },
    onCancelClick() {
      this.$emit("onCancelClick");
    },
    onPublishClick() {
      this.$emit("onPublishClick");
    },
    onTeaserInput(event) {
      formStorageUpdate("postForm", {
        type: "current",
        name: "teaser",
        value: event.target.value
      });
    },
    onSlugInput(event) {
      formStorageUpdate("postForm", {
        type: "current",
        name: "slug",
        value: event.target.value
      });
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
