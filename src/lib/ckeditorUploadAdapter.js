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
    // each image is uploaded in a folder name after the pod Id, so
    // make sure we have a podId param at this point.
    if (!Router.currentRoute.params.podId) {
      throw new Error(
        "ckeditorUploadAdapter : No pod Id detected in the current url, aborting upload !"
      );
    }
    return this.loader.file.then(file => {
      return apolloClient
        .mutate({
          mutation: uploadQuery,
          // put file in a folder named after the pod Id.
          variables: {
            file,
            podId: Router.currentRoute.params.podId
          }
        })
        .then(result => {
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
