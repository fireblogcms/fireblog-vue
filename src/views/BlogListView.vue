<template>
  <AdminLayout>
    <AppLoader v-if="initDataState === 'PENDING'">Loading blogs</AppLoader>

    <AppError v-if="error" :error="error">Sorry, an error occured while signing in</AppError>

    <template v-if="initDataState === 'COMPLETED_OK'">
      <!-- if this is the fiirs blog, display form to create a blog -->
      <template v-if="blogs.edges.length === 0">
        <div class="section container">
          <BlogCreateForm :first="true" />
        </div>
      </template>
      <!-- else, display the blog list -->
      <template v-if="blogs && blogs.edges.length > 0">
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
                @click="onRowClick(edge)"
              >
                <h2 class="title is-2">
                  <router-link :to="buildLinkToPostList(edge)">{{ edge.node.name }}</router-link>
                </h2>
              </div>
            </div>
          </div>
        </div>
      </template>
    </template>
  </AdminLayout>
</template>

<script>
import apolloClient from "../lib/apolloClient";
import BlogCreateForm from "../components/BlogCreateForm";
import BulmaGrid from "../components/BulmaGrid";
import AdminLayout from "../layouts/AdminLayout";
import AppLoader from "../components/AppLoader";
import gql from "graphql-tag";
import BulmaButtonLink from "../components/BulmaButtonLink";
import { REQUEST_STATE } from "../lib/helpers";
import AppNotify from "../components/AppNotify";
import ButtonLink from "../components/ButtonLink";
import LayoutBody from "../components/LayoutBody";
import AppError from "../components/AppError";
import LayoutList from "../components/LayoutList";
import logger from "../lib/logger";

const myBlogsQuery = gql`
  query myBlogsQuery {
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
    LayoutBody,
    AppError,
    BulmaButtonLink,
    BlogCreateForm,
    BulmaGrid,
    AdminLayout,
    AppLoader,
    AppNotify,
    ButtonLink,
    LayoutList
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
      this.error = null;
      this.initDataState = REQUEST_STATE.PENDING;
      Promise.all([this.getBlogs()])
        .then(() => {
          this.initDataState = REQUEST_STATE.COMPLETED_OK;
        })
        .catch(error => {
          this.initDataState = REQUEST_STATE.COMPLETED_ERROR;
          this.error = error;
        });
    },
    blogCardStyles(edge, index) {
      const styles = {
        backgroundSize: "cover"
      };
      if (edge.node.image) {
        styles["backgroundImage"] = `url(${edge.node.image})`;
      } else {
        if (this.blogsDefaultImagesMap[edge.node._id]) {
          styles["backgroundImage"] = `url(${
            this.blogsDefaultImagesMap[edge.node._id]
          })`;
        } else {
          styles["background-color"] = "rgb(240,240,240)";
        }
      }
      return styles;
    },
    buildLinkToPostList(item) {
      return { name: "postList", params: { blogId: item.node._id } };
    },
    onRowClick(item) {
      this.$router.push(this.buildLinkToPostList(item));
    },
    getBlogs() {
      return apolloClient
        .query({ query: myBlogsQuery })
        .then(result => {
          this.blogs = result.data.me.blogs;
          this.blogsEdgesReversed = [...this.blogs.edges].reverse();
          this.blogsDefaultImagesMap = this.mapDefaultImagesToBlogId();
          return this.blogs;
        })
        .catch(e => {
          this.error = e;
        });
    },
    defaultImages() {
      return [
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1650&q=80",
        "https://images.unsplash.com/photo-1506260408121-e353d10b87c7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60",
        "https://images.unsplash.com/photo-1469827160215-9d29e96e72f4?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60",
        "https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60",
        "https://images.unsplash.com/photo-1476610182048-b716b8518aae?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60",
        "https://images.unsplash.com/photo-1524260855046-f743b3cdad07?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60",
        "https://images.unsplash.com/photo-1433838552652-f9a46b332c40?ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=80",
        "https://images.unsplash.com/photo-1501791330673-603715379ded?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1500&q=80",
        "https://images.unsplash.com/photo-1501854140801-50d01698950b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60",
        "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60",
        "https://images.unsplash.com/photo-1483086431886-3590a88317fe?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60",
        "https://images.unsplash.com/photo-1446292532430-3e76f6ab6444?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60",
        "https://images.unsplash.com/photo-1492724724894-7464c27d0ceb?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60",
        "https://images.unsplash.com/photo-1518495973542-4542c06a5843?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60",
        "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60",
        "https://images.unsplash.com/photo-1526749837599-b4eba9fd855e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60",
        "https://images.unsplash.com/photo-1536431311719-398b6704d4cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60",
        "https://images.unsplash.com/photo-1510797215324-95aa89f43c33?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60",
        "https://images.unsplash.com/photo-1508873881324-c92a3fc536ba?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60",
        "https://images.unsplash.com/photo-1540202403-b7abd6747a18?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60",
        "https://images.unsplash.com/photo-1547036967-23d11aacaee0?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60",
        "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60",
        "https://images.unsplash.com/photo-1546948630-1149ea60dc86?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60",
        "https://images.unsplash.com/reserve/HgZuGu3gSD6db21T3lxm_San%20Zenone.jpg?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60",
        "https://images.unsplash.com/photo-1436968188282-5dc61aae3d81?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60"
      ];
    },
    mapDefaultImagesToBlogId() {
      const images = this.defaultImages();
      const mapping = {};
      this.blogsEdgesReversed.forEach((edge, index) => {
        mapping[edge.node._id] = images[index];
      });
      return mapping;
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
</style>

