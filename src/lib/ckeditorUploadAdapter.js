import apolloClient from "./apolloClient";
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

class ckeditorUploadAdapter {
  constructor(loader) {
    // The file loader instance to use during the upload. It sounds scary but do not
    // worry — the loader will be passed into the adapter later on in this guide.
    this.loader = loader;
  }

  // Starts the upload process.
  upload() {
    return this.loader.file.then(file => {
      return apolloClient.mutate({
        mutation: uploadQuery,
        variables: {
          file,
          podId: "Naoned"
        }
      });
    });
  }

  // Aborts the upload process.
  abort() {
    alert("aborted");
  }

  // ...
}

export function ckeditorUploadAdapterPlugin(editor) {
  editor.plugins.get("FileRepository").createUploadAdapter = loader => {
    // Configure the URL to the upload script in your back-end here!
    return new ckeditorUploadAdapter(loader);
  };
}
