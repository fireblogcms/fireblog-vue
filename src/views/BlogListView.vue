<template>
  <DefaultLayout>
    <AppLoader v-if="initDataState === 'PENDING'">Loading blogs</AppLoader>

    <AppError v-if="errorMessage">{{errorMessage}}</AppError>

    <!-- if this is the fiirs blog, display form to create a blog -->
    <template v-if="initDataState === 'FINISHED_OK' && blogs &&  blogs.edges.length === 0">
      <div class="section container">
        <BlogCreateForm :first="true" />
      </div>
    </template>
    <!-- else, display the blog list -->
    <template v-if="initDataState === 'FINISHED_OK' && blogs && blogs.edges.length > 0">
      <div class="container">
        <div class="animated fadeIn">
          <header style="padding: 0 1rem 2rem 1rem">
            <div class="columns">
              <div class="column">
                <h1 style="padding-bottom:2rem;" class="title is-1">
                  <img
                    height="70"
                    style="position:relative;top:25px;padding-right:1rem"
                    src="/images/books-icon.png"
                  />
                  My blogs
                </h1>
              </div>
              <div class="column">
                <BulmaButtonLink
                  class="is-primary is-large main-call-to-action"
                  :to="{name:'blogCreate'}"
                >
                  <img width="40" style="margin-right:10px" src="/images/book.png" /> CREATE A NEW BLOG
                </BulmaButtonLink>
              </div>
            </div>
          </header>
          <div class="container">
            <div
              v-for="(edge, index) in blogs.edges"
              style="box-shadow: 0px 4px 5px rgba(229, 229, 229, 1);"
              :style="blogCardStyles(edge, index)"
              class="blog-card"
              :key="edge.node._id"
              @click="onRowClick(edge, $event)"
            >
              <h2 class="title is-2" style="color:white;">{{ edge.node.name }}</h2>
              <div
                @click.stop="onSettingsClick(edge.node, $event)"
                style="min-width:100px"
                class="button is-medium is-outlined settings"
              >Settings</div>
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
import BulmaButtonLink from "../components/BulmaButtonLink";
import { REQUEST_STATE } from "../utils/helpers";
import AppError from "../components/AppError";
import logger from "../utils/logger";
import gradient from "random-gradient";

const meWithMyBlogsQuery = gql`
  query meWithMyBlogsQuery {
    me {
      name
      blogs(last: 100) {
        edges {
          node {
            _id
            name
            description
            createdAt
            updatedAt
          }
        }
      }
    }
  }
`;

export default {
  components: {
    AppError,
    BulmaButtonLink,
    BlogCreateForm,
    DefaultLayout,
    AppLoader
  },
  data() {
    return {
      blogs: null,
      error: null,
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
        backgroundSize: "cover"
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
      this.errorMessage = null;
      return apolloClient
        .query({ query: meWithMyBlogsQuery })
        .then(result => {
          this.blogs = result.data.me.blogs;
          return this.blogs;
        })
        .catch(error => {
          this.errorMessage =
            "Sorry, an error occured while fetching blog:" + error;
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

.blog-card {
  position: relative;
  max-width: 700px;
  margin: auto;
  cursor: pointer;
  border-radius: 3px;
  border: solid rgb(240, 240, 240) 1px;
  background: white;
  margin-bottom: 40px;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.blog-card .title {
  width: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  text-align: center;
  padding: 10px;
}

.blog-card .title a {
  color: white;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.5);
}

.blog-card .settings {
  background: rgba(255, 255, 255, 0.9);
  position: absolute;
  bottom: 20px;
  right: 20px;
}
</style>

