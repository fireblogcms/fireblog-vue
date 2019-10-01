<template>
  <div class="root container">
    <form @submit.prevent>
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

      <div class="field">
        <label class="label">Featured Image</label>
        <CloudinaryImageUpload @onUploaded="onUploaded" />
      </div>
    </form>

    <!-- debug form values -->
    <pre v-if="false">{{form}}</pre>
  </div>
</template>

<script>
import CloudinaryImageUpload from "./CloudinaryImageUpload";
import {
  REQUEST_STATE,
  cloudinaryUploadImage,
  getCloudinaryBlogFolderPath
} from "../utils/helpers";

export default {
  inject: ["form"],
  components: {
    CloudinaryImageUpload
  },
  data() {
    return {
      uploadProgress: 0,
      file: null,
      featuredImage: null
    };
  },
  methods: {
    onUploaded(result) {
      this.form.values.current.featuredImage = result.default;
    }
  }
};
</script>


