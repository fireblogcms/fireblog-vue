<template>
  <DefaultLayout>
    <AppLoader v-if="initDataState === 'PENDING'">Loading blogs</AppLoader>

    <!-- if this is the fiirs blog, display form to create a blog -->
    <template
      v-if="
        initDataState === 'FINISHED_OK' && blogs && blogs.edges.length === 0
      "
    >
      <div class="container is-small">
        <BlogCreateForm :isMyFirstBlog="true" />
      </div>
    </template>
    <!-- else, display the blog list -->
    <template
      v-if="initDataState === 'FINISHED_OK' && blogs && blogs.edges.length > 0"
    >
      <div class="container">
        <div>
          <header style="padding: 0 1rem 2rem 1rem">
            <div class="columns">
              <div class="column">
                <h1
                  style="padding-bottom:2rem;"
                  class="title is-2 is-uppercase"
                >
                  <img
                    height="70"
                    style="position:relative;top:25px;padding-right:1rem"
                    src="/images/books-icon.png"
                  />
                  {{ $t("views.blogList.title") }}
                </h1>
              </div>
              <div class="column">
                <button
                  class="button is-primary is-box-shadowed is-large main-call-to-action"
                  @click="$router.push({ name: 'blogCreate' })"
                >
                  <!--<img width="40" style="margin-right:10px" src="/images/book.png" />-->
                  {{ $t("views.blogList.createNewBlogButton").toUpperCase() }}
                </button>
              </div>
            </div>
          </header>
          <div class="container">
            <div class="columns">
              <div
                class="column is-three-fifths is-offset-one-fifth centered-column"
              >
                <div
                  v-for="(edge, index) in blogs.edges"
                  class="card"
                  :key="edge.node._id"
                >
                  <div
                    class="card-image"
                    :style="blogCardStyles(edge, index)"
                    @click="onRowClick(edge, $event)"
                  >
                    <div class="blog-infos">
                      <h2 class="title">{{ edge.node.name }}</h2>
                      <h3 class="subtitle" v-if="edge.node.description">
                        {{ edge.node.description }}
                      </h3>
                    </div>
                  </div>
                  <div class="card-content">
                    <div>
                      <p class="plans-name">
                        Plan : firestarter ({{
                          $t("views.blogList.oneMonthFreeTrial")
                        }})
                      </p>
                      <ApiUsage :blogId="edge.node._id"></ApiUsage>
                    </div>
                    <button
                      class="button is-box-shadowed is-large"
                      @click="onSettingsClick(edge.node, $event)"
                    >
                      <span class="settings-icon"></span>
                      <span>{{
                        $t("views.blogList.settingsButton").toUpperCase()
                      }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </DefaultLayout>
</template>

<script>
import apolloClient from "../utils/apolloClient";
import BlogCreateForm from "../components/BlogCreateForm";
import DefaultLayout from "../layouts/DefaultLayout";
import AppLoader from "../components/AppLoader";
import gql from "graphql-tag";
import { REQUEST_STATE, appNotification } from "../utils/helpers";
import logger from "../utils/logger";
import gradient from "random-gradient";
import { getMyBlogs } from "../utils/helpers";
import ApiUsage from "../components/ApiUsage";

export default {
  components: {
    DefaultLayout,
    BlogCreateForm,
    AppLoader,
    ApiUsage
  },
  data() {
    return {
      blogs: null,
      initDataState: REQUEST_STATE.NOT_STARTED
    };
  },
  methods: {
    initData() {
      this.initDataState = REQUEST_STATE.PENDING;
      Promise.all([this.getBlogs()])
        .then(() => {
          this.initDataState = REQUEST_STATE.FINISHED_OK;
        })
        .catch(error => {
          this.initDataState = REQUEST_STATE.FINISHED_ERROR;
          throw new Error(error);
        });
    },
    blogCardStyles(edge, index) {
      const styles = {
        backgroundSize: "cover",
        backgroundPosition: "center"
      };
      if (edge.node.image) {
        styles.backgroundImage = `url(${edge.node.image})`;
      } else {
        styles.background = gradient(edge.node._id);
      }
      return styles;
    },
    buildLinkToPostList(item) {
      return { name: "postList", params: { blogId: item.node._id } };
    },
    getBlogs() {
      return getMyBlogs()
        .then(blogs => {
          this.blogs = blogs;
          return blogs;
        })
        .catch(error => {
          appNotification(
            "Sorry, an error occured while fetching blog:" + error,
            "error"
          );
          throw new Error(error);
        });
    },
    onRowClick(item, event) {
      this.$router.push(this.buildLinkToPostList(item));
    },
    onSettingsClick(blog) {
      this.$router.push({
        name: "blogSettings",
        params: {
          blogId: blog._id
        }
      });
    }
  },
  created() {
    this.initData();
  }
};
</script>

<style scoped>
.main-call-to-action {
  float: right;
  margin-top: 30px;
}

@media screen and (max-width: 768px) {
  .main-call-to-action {
    float: none;
    margin-top: 0px;
  }
}

.centered-column {
  padding-bottom: 5rem;
}

.card-image {
  min-height: 20rem;
  position: relative;
  cursor: pointer;
}

.card-image .blog-infos {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  padding: 0.7rem;
  text-align: center;
  background-color: rgba(0, 0, 0, 0.5);
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.5);
}

.blog-infos .title,
.blog-infos .subtitle {
  color: white;
}

.blog-infos .subtitle {
  font-style: italic;
}

.card {
  border-radius: 5px;
  margin-bottom: 40px;
}

.card-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.plans-name {
  margin: 0 0 1rem 0;
  font-weight: 500;
}

.settings-icon {
  margin-right: 0.7rem;
  width: 30px;
  height: 30px;
  background: url("/images/icon-settings.svg") no-repeat;
}

@media screen and (max-width: 768px) {
  .card-content {
    display: flex;
    flex-direction: column;
    text-align: center;
  }

  .card-content button {
    margin-top: 2rem;
  }
}
</style>
