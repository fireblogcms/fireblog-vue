<template>
  <div class="container" style="border-top-left-radius:0; margin:30px;">
    <AppLoader v-show="postsRequestState === 'PENDING'" />
    <template
      v-if="postsRequestState === 'FINISHED_OK' && posts.edges.length === 0"
    >
      <div class="content section has-text-centered">
        {{ $t("views.postList.noPostFound") }}
      </div>
    </template>
    <template
      v-if="postsRequestState === 'FINISHED_OK' && posts.edges.length > 0"
    >
      <AppList :items="posts.edges" :itemUniqueKey="edge => edge.node._id">
        <template v-slot="{ item }">
          <div class="columns">
            <div class="column is-2">
              <div
                v-show="item.node.image"
                v-lazy:background-image="item.node.image"
                class="post-list-image"
              />
            </div>
            <div @click="onRowClick(item)" class="column is-8 content">
              <h2 class="post-list-title">
                <router-link
                  class="item"
                  :to="{
                    name: 'postUpdate',
                    params: {
                      blogId: $route.params.blogId,
                      postId: item.node._id
                    }
                  }"
                  >{{ item.node.title + " " }}</router-link
                >
              </h2>
              <span
                style="color:rgba(0, 0, 0, 0.5);"
                v-if="item.node.status === 'PUBLISHED'"
              >
                {{
                  $t("views.postList.publishedOn", {
                    date: publishedOnDate(item)
                  })
                }}
              </span>
              <span
                style="color:rgba(0, 0, 0, 0.5);"
                v-if="item.node.status === 'DRAFT'"
              >
                {{
                  $t("views.postList.updatedOn", {
                    date: updatedOnDate(item)
                  })
                }}
              </span>
              <p style="padding-top:10px" v-if="item.node.teaser.trim()">
                {{ striptags(item.node.teaser) }}
              </p>
            </div>
            <div class="column is-2">
              <div class="actions">
                <span
                  @click="onDeleteClick(item.node)"
                  style="min-width:100px"
                  class="button is-outlined is-pulled-right"
                  >{{ $t("views.postList.deleteButton") }}</span
                >
              </div>
            </div>
          </div>
        </template>
      </AppList>
    </template>
  </div>
</template>

<script>
import AppLoader from "./AppLoader";
import AppList from "./AppList";
import striptags from "striptags";
import { formatDate } from "../utils/helpers";

export default {
  components: {
    AppLoader,
    AppList
  },
  props: {
    posts: {
      type: Object,
      required: true
    },
    postsRequestState: {
      type: String,
      required: true
    }
  },
  created() {
    this.striptags = striptags;
  },
  methods: {
    publishedOnDate(item) {
      return formatDate(new Date(item.node.publishedAt), "long");
    },
    updatedOnDate(item) {
      return formatDate(new Date(item.node.updatedAt), "long");
    },
    onDeleteClick(post) {
      this.$emit("onDeleteClick", post);
    },
    onRowClick(post) {
      this.$emit("onRowClick", post);
    }
  }
};
</script>

<style scoped>
.post-list-image {
  background-position: center center;
  background-repeat: no-repeat;
  background-size: cover;
  margin: auto;
  margin-top: 5px;
  width: 100%;
  height: 100px;
  overflow: hidden;
  padding: 20px;
  border-radius: 3px;
}
.post-list-title {
  margin-bottom: 0;
  padding: 0;
}
@media screen and (min-width: 1024px) {
  .actions .button {
    margin-bottom: 15px;
  }
}

@media screen and (max-width: 768px) {
  .actions {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
  }
  .actions .button {
    margin-left: 20px;
  }
  .main-call-to-action {
    margin-top: 0px;
    float: none;
  }
}
</style>
