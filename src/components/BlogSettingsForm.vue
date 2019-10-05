<template>
  <div>
    <AppLoader v-if="initDataState === 'PENDING'">Loading blogs</AppLoader>
    <AppError v-if="errorMessage">{{errorMessage}}</AppError>
    <LayoutBody v-if="initDataState === 'FINISHED_OK'">
      <div class="columns">
        <div class="column is-2">
          <nav class="panel" style="margin-top:33px">
            <a class="panel-block is-active">
              <span class="panel-icon">
                <i class="fas fa-book" aria-hidden="true"></i>
              </span>
              General
            </a>
            <a class="panel-block">
              <span class="panel-icon">
                <i class="fas fa-book" aria-hidden="true"></i>
              </span>
              Webooks
            </a>
          </nav>
        </div>
        <div class="column">
          <div class="field">
            <label class="label">Name</label>
            <div class="control">
              <input class="input" v-model="blog.name" type="text" placeholder="Text input" />
            </div>
          </div>

          <div class="field">
            <label class="label">Username</label>
            <div class="control has-icons-left has-icons-right">
              <input class="input is-success" type="text" placeholder="Text input" value="bulma" />
              <span class="icon is-small is-left">
                <i class="fas fa-user"></i>
              </span>
              <span class="icon is-small is-right">
                <i class="fas fa-check"></i>
              </span>
            </div>
            <p class="help is-success">This username is available</p>
          </div>
        </div>
      </div>
    </LayoutBody>
  </div>
</template>

<script>
import LayoutBody from "../components/LayoutBody";
import { getBlog, REQUEST_STATE } from "../utils/helpers";
import AppLoader from "../components/AppLoader";
import AppError from "../components/AppError";
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
      initDataState: REQUEST_STATE.NOT_STARTED
    };
  },
  created() {
    this.initData();
  },
  methods: {
    initData() {
      this.errorMessage = null;
      this.initDataState = REQUEST_STATE.PENDING;
      getBlog(this.$route.params.blogId)
        .then(blog => {
          this.blog = blog;
          this.initDataState = REQUEST_STATE.FINISHED_OK;
        })
        .catch(error => {
          this.errorMessage = error;
          this.initDataState = REQUEST_STATE.FINISHED_ERROR;
        });
    }
  }
};
</script>
