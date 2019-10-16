<template>
  <div class="root container">
    <form @submit.prevent>
      <div class="columns">
        <div class="column">
          <!-- IMAGE UPLOAD FIELD -->
          <div class="field">
            <label>
              <strong>Image</strong>
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
              <strong>Teaser</strong>: a short introductory for your post that stimulates readers interest.
            </label>
            <div class="control">
              <textarea
                v-model="form.values.current.teaser"
                class="textarea is-large"
                placeholder="Accroche"
              ></textarea>
            </div>
            <p class="help is-danger" v-if="form.errors.teaser">{{form.errors.teaser}}</p>
          </div>
          <!-- SLUG FIELD -->
          <div class="field">
            <label>
              <strong>Slug</strong>: used to build a seo-friendly url for your post.
            </label>

            <div class="control">
              <input
                v-model="form.values.current.slug"
                class="input is-large"
                type="text"
                placeholder="slug"
              />
            </div>
            <p class="help is-danger" v-if="form.errors.slug">{{form.errors.slug}}</p>
          </div>
        </div>
        <div class="column">
          <div class="preview-help has-text-centered">
            <em>Approximative preview of how your story will appear when sharing its link on other websites like Twitter, Facebook etc:</em>
          </div>
          <div class="post-preview">
            <div
              v-if="this.form.values.current.image"
              class="post-preview-image"
              :style="{backgroundImage: `url(${this.form.values.current.image})`}"
            ></div>
            <div class="post-preview-content">
              <div>
                <strong>{{form.values.current.title}}</strong>
              </div>
              <div class="content">{{form.values.current.teaser}}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="other settings">
        <div class="actions">
          <button @click="onCancelClick" class="button is-large">Cancel</button>
          <button
            @click="onPublishClick"
            :disabled="savingPost.state === 'PENDING' || uploadingState === 'PENDING'"
            :class="{ 'is-loading': savingPost.state === 'PENDING' && savingPost.publicationStatus === 'PUBLISHED'}"
            class="button is-primary is-large"
            style="margin-left:20px;"
          >{{getPublishButtonText()}}</button>
        </div>
      </div>
    </form>
    <!-- debug form values -->
    <pre v-if="false">{{form}}</pre>
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
.actions {
  display: flex;
  justify-content: center;
}
.post-preview-help {
  max-width: 500px;
}
.post-preview {
  max-width: 500px;
  margin-top: 10px;
  margin: 20px auto;
  border-radius: 3px;
  border: 1px solid #dedede;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
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


