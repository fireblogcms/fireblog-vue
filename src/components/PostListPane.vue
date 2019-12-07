<template>
  <div class="container" style="border-top-left-radius:0;">
    <AppLoader v-show="postsRequestState === 'PENDING'" />
    <template v-if="postsRequestState === 'FINISHED_OK' && posts.edges.length === 0">
      <div class="content section has-text-centered">No posts founds.</div>
    </template>
    <template v-if="postsRequestState === 'FINISHED_OK' && posts.edges.length > 0">
      <AppList :items="posts.edges" :itemUniqueKey="item => item.node._id">
        <template v-slot="{ item }">
          <div class="columns">
            <div class="column is-1">
              <div
                v-if="item.node.image"
                v-lazy:background-image="item.node.image"
                class="post-list-image"
              />
            </div>
            <div @click="onRowClick(item)" class="column is-9 content">
              <h2 class="post-list-title">
                <router-link
                  class="item"
                  :to="{name: 'postUpdate', params: {blogId: $route.params.blogId,postId: item.node._id}}"
                >{{ item.node.title + " " }}</router-link>
              </h2>
              <span
                style="color:rgba(0, 0, 0, 0.5);"
                v-if="item.node.status === 'PUBLISHED'"
              >{{$t("views.postList.publishedOn", {date: moment(Number(item.node.publishedAt)).format("DD MMMM YYYY - HH:mm")})}}</span>
              <span
                style="color:rgba(0, 0, 0, 0.5);"
                v-if="item.node.status === 'DRAFT'"
              >{{$t("views.postList.updatedOn", {date: moment(Number(item.node.updatedAt)).format("DD MMMM YYYY - HH:mm")})}}</span>
              <p
                style="padding-top:10px"
                v-if="item.node.teaser.trim()"
              >{{ striptags(item.node.teaser.substr(0, 200)) }}</p>
            </div>
            <div class="column is-2">
              <div class="actions">
                <span
                  @click="onDeleteClick(item.node)"
                  style="min-width:100px"
                  class="button is-outlined"
                >{{ $t("views.postList.deleteButton") }}</span>
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
import moment from "moment";
import striptags from "striptags";

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
    this.moment = moment;
    this.striptags = striptags;
  },
  methods: {
    onDeleteClick(post) {
      this.$emit("onDeleteClick", post);
    },
    onRowClick(post) {
      this.$emit("onRowClick", post);
    }
  }
};
</script>