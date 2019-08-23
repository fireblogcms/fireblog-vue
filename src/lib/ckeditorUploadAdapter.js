import apolloClient from "./apolloClient";
import gql from "graphql-tag";
import Router from "../router";

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

class ckeditorUploadAdapter {
  constructor(loader) {
    // The file loader instance to use during the upload. It sounds scary but do not
    // worry — the loader will be passed into the adapter later on in this guide.
    this.loader = loader;
  }

  // Starts the upload process.
  upload() {
    // Each image is uploaded in a folder name after the pod Id, so
    // make sure we have a blogId param at this point.
    if (!Router.currentRoute.params.blogId) {
      throw new Error(
        "ckeditorUploadAdapter : No pod Id detected in the current url, aborting upload !"
      );
    }

    // this.loader.file is a File object : https://developer.mozilla.org/en-US/docs/Web/API/File
    // apollo-upload-client package allow us to send this File Object directly
    // as a variable of our mutation and streams the file to our resolver :
    // @see https://github.com/jaydenseric/graphql-multipart-request-spec
    return this.loader.file.then(file => {
      return apolloClient
        .mutate({
          mutation: uploadQuery,
          // put file in a folder named after the pod Id.
          variables: {
            file,
            podId: Router.currentRoute.params.blogId
          }
        })
        .then(result => {
          // is the default url to use to display our uploaded image.
          // Here it is possible to return different srcset if needed.
          return {
            default: result.data.upload.url
          };
        });
    });
  }

  // Aborts the upload process.
  abort() {
    alert("aborted");
  }
}

export function ckeditorUploadAdapterPlugin(editor) {
  editor.plugins.get("FileRepository").createUploadAdapter = loader => {
    // Configure the URL to the upload script in your back-end here!
    return new ckeditorUploadAdapter(loader);
  };
}
