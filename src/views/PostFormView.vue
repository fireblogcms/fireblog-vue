<template>
  <AdminLayout>
    <div class="write-view">
      <!--
    <div class="write-menu">
      <div class="item">
        <button class="button">Publish</button>
      </div>
      <div class="item">
        <button class="button">Save</button>
      </div>
      <div class="item">
        <button class="button">API</button>
      </div>
    </div>
      -->
      <input type="file" accept="image/*" @change="uploadPhoto" />
      <PostForm />
    </div>
  </AdminLayout>
</template>

<script>
import apolloClient from "../lib/apolloClient";
import PostForm from "@/components/PostForm";
import AdminLayout from "@/layouts/AdminLayout";
import gql from "graphql-tag";

const uploadQuery = gql`
  mutation uploadQuery($file: Upload!, $podId: ID!) {
    upload(file: $file, podId: $podId) {
      url
      filename
      mimetype
      encoding
    }
  }
`;

export default {
  name: "home",
  components: {
    PostForm,
    AdminLayout
  },
  methods: {
    uploadPhoto({ target }) {
      return apolloClient
        .mutate({
          mutation: uploadQuery,
          variables: {
            file: target.files[0],
            podId: this.$route.params.podId
          }
        })
        .then(result => {
          console.log("result", result);
        })
        .catch(error => {
          console.log("e", error);
        });
    }
  }
};
</script>
