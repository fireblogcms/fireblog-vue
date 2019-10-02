<template>
  <div class="root container">
    <form @submit.prevent>
      <div class="columns">
        <div class="column">
          <div class="field">
            <label class="label">Featured Image</label>
            <CloudinaryImageUpload
              @onUploadingStateChange="onUploadingStateChange"
              :initialImage="form.values.initial.image"
              @onUploaded="onUploaded"
            />
          </div>
        </div>
        <div class="column">
          <div class="field">
            <label class="label">Slug</label>
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

          <div class="field">
            <label class="label">Accroche</label>
            <div class="control">
              <textarea
                v-model="form.values.current.teaser"
                class="textarea is-large"
                placeholder="Accroche"
              ></textarea>
            </div>
            <p class="help is-danger" v-if="form.errors.teaser">{{form.errors.teaser}}</p>
          </div>

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
      </div>
    </form>
    <!-- debug form values -->
    <pre v-if="false">{{form}}</pre>
  </div>
</template>

<script>
import CloudinaryImageUpload from "./CloudinaryImageUpload";
import { REQUEST_STATE } from "../utils/helpers";

export default {
  inject: ["form", "existingPost", "savingPost"],
  components: {
    CloudinaryImageUpload
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
.actions {
  padding-top: 30px;
  display: flex;
  justify-content: flex-start;
}
</style>


