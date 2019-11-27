<template>
  <div class="root container">
    <form @submit.prevent>
      <div class="columns">
        <div class="column">
          <!-- IMAGE UPLOAD FIELD -->
          <div class="field">
            <label>
              <strong>Featured image</strong>
            </label>
            <CloudinaryImageDirectUpload
              :displayImageWhenUploaded="false"
              @onUploadingStateChange="onUploadingStateChange"
              :initialImage="form.values.initial.image"
              @onUploaded="onUploaded"
            />
          </div>
          <!-- TEASER FIELD -->
          <div class="field">
            <label>
              <strong>Teaser</strong>
              <div class="field-help">
                a short introductory for your post that stimulates readers
                interest. 250 characters max.
              </div>
            </label>
            <div class="control">
              <!-- limited to 250 because of facebook, twitter and co preview card limitation -->
              <textarea
                maxlength="250"
                v-model="form.values.current.teaser"
                class="textarea is-medium"
                placeholder="Teaser"
              ></textarea>
            </div>
            <p class="help is-danger" v-if="form.errors.teaser">
              {{ form.errors.teaser }}
            </p>
          </div>
          <!-- SLUG FIELD -->
          <div class="field">
            <label>
              <strong>Slug</strong>
              <div class="field-help">
                used to build a seo-friendly url for your post.
              </div>
            </label>

            <div class="control">
              <input
                v-model="form.values.current.slug"
                class="input is-medium"
                type="text"
                placeholder="slug"
              />
            </div>
            <p class="help is-danger" v-if="form.errors.slug">
              {{ form.errors.slug }}
            </p>
          </div>
        </div>
        <div class="column">
          <div class="post-preview-wrapper">
            <div class="field-help">
              <label class="label">Post card preview</label>
              Approximation of how your post will appear when sharing its link
              on other websites like Twitter, Facebook etc:
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
        </div>
      </div>
      <div class="columns">
        <div class="column">
          <div class="actions">
            <button @click="onCancelClick" class="button is-medium">
              Go back
            </button>

            <button
              @click="onPublishClick()"
              :disabled="
                savingPost.state === 'PENDING' || uploadingState === 'PENDING'
              "
              :class="{
                'is-loading':
                  savingPost.state === 'PENDING' &&
                  savingPost.publicationStatus === 'PUBLISHED'
              }"
              class="button is-primary is-medium"
              style="margin-left:20px;"
            >
              {{ getPublishButtonText() }}
            </button>
          </div>
        </div>
      </div>
    </form>
    <!-- debug form values -->
    <pre v-if="false">{{ form }}</pre>
  </div>
</template>

<script>
import CloudinaryImageDirectUpload from "./CloudinaryImageDirectUpload";
import { REQUEST_STATE } from "../utils/helpers";

export default {
  inject: ["form", "existingPost", "savingPost"],
  components: {
    CloudinaryImageDirectUpload
  },
  data() {
    const data = {
      uploadingState: null,
      file: null
    };
    return data;
  },
  methods: {
    onUploaded(result) {
      this.form.values.current.image = result.default;
    },
    onCancelClick() {
      this.$emit("onCancelClick");
    },
    onPublishClick() {
      this.$emit("onPublishClick");
    },
    getPublishButtonText() {
      return this.existingPost() && this.existingPost().status === "PUBLISHED"
        ? "PUBLISH CHANGES"
        : "PUBLISH NOW";
    },
    onUploadingStateChange(state) {
      this.uploadingState = state;
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
