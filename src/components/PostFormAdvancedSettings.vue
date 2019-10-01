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
          <textarea class="textarea" placeholder="Accroche"></textarea>
        </div>
      </div>
    </form>

    <!-- debug form values -->
    <pre v-if="true">{{form}}</pre>
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

