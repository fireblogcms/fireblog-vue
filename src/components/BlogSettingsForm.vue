<template>
  <div>
    <pre v-if="false">{{form}}</pre>
    <AppLoader v-if="initDataState === 'PENDING'">Loading blogs</AppLoader>
    <AppError v-if="errorMessage">{{errorMessage}}</AppError>
    <LayoutBody
      style="margin-top:40px;padding:40px;"
      class="container"
      v-if="initDataState === 'FINISHED_OK'"
    >
      <form @submit.prevent="onFormSubmit">
        <div class="field">
          <label class="label">Name</label>
          <div class="control">
            <input v-model="form.values.current.name" class="input is-large" type="text" />
          </div>
        </div>
        <div class="field">
          <label class="label">Description</label>
          <div class="control">
            <input class="input is-large" v-model="form.values.current.description" type="text" />
          </div>
        </div>
        <div>
          <button
            style="margin-top:20px;"
            class="button is-outlined is-primary is-large"
            type="submit"
          >Save</button>
        </div>
      </form>
    </LayoutBody>
  </div>
</template>

<script>
import LayoutBody from "../components/LayoutBody";
import { getBlog, REQUEST_STATE, formInitData } from "../utils/helpers";
import AppLoader from "../components/AppLoader";
import AppError from "../components/AppError";
import apolloClient from "../utils/apolloClient";

const initialFormValues = {
  name: "",
  description: ""
};

export default {
  components: {
    LayoutBody,
    AppLoader,
    AppError,
    LayoutBody
  },
  data() {
    return {
      blog: null,
      initDataState: REQUEST_STATE.NOT_STARTED,
      form: formInitData({ initialFormValues })
    };
  },
  created() {
    this.initData();
  },
  methods: {
    validateForm() {
      const errors = {};
      if (!this.form.values.name.trim()) {
        errors.name = "Name is required";
      }
      return errors;
    },
    initData() {
      this.errorMessage = null;
      this.initDataState = REQUEST_STATE.PENDING;
      getBlog(this.$route.params.blogId)
        .then(blog => {
          this.blog = blog;
          this.initDataState = REQUEST_STATE.FINISHED_OK;
          this.form = formInitData({
            initialFormValues: {
              name: blog.name,
              description: blog.description
            }
          });
        })
        .catch(error => {
          this.errorMessage = error;
          this.initDataState = REQUEST_STATE.FINISHED_ERROR;
        });
    },
    onFormSubmit() {
      console.log("this.form", this.form);
    }
  }
};
</script>
