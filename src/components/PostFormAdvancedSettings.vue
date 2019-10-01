<template>
  <div class="post-form-advanced-settings">
    <form @submit.prevent>
      <div class="field">
        <label class="label">Slug.</label>
        <div class="control">
          <input
            v-model="form.values.current.slug"
            class="input is-large"
            type="text"
            placeholder="slug"
          />
        </div>
      </div>

      <div class="field">
        <label class="label">Accroche</label>
        <div class="control">
          <textarea class="textarea is-large" placeholder="Accroche"></textarea>
        </div>
      </div>

      <div class="field has-text-centered">
        <label class="label">Image mise en avant</label>
        <div class="file is-large is-boxed has-name has-text-centered">
          <label class="file-label">
            <input class="file-input" type="file" name="resume" />
            <span class="file-cta">
              <span class="file-icon">
                <i class="fas fa-upload"></i>
              </span>
              <span class="file-label">Large file…</span>
            </span>
            <span class="file-name">Screen Shot 2017-07-29 at 15.54.25.png</span>
          </label>
        </div>
      </div>
    </form>

    <!-- debug form values -->
    <pre v-if="false">{{form}}</pre>
  </div>
</template>

<script>
import { formInitData } from "../utils/helpers";

// ^[a-z](-?[a-z])*$
export default {
  data() {
    return {
      form: formInitData({
        slug: ""
      })
    };
  },
  methods: {
    validate() {}
  }
};
</script>

