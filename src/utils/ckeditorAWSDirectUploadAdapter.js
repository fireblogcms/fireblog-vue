import Router from '../router';
import apolloClient from './apolloClient';
import gql from 'graphql-tag';
import { REQUEST_STATE } from './helpers';

/**
 * Upload an image directly from ckEditor to AWS servers with an XMLHttpRequest
 * - less CPU for our own servers
 * - Better and easier tracking of upload progress (which is critical because publishing
 * an article if a image is not 100% uploaded will result in loss of this image)
 */
class ckeditorAWSDirectUploadAdapter {
  constructor(loader, options) {
    // The file loader instance to use during the upload. It sounds scary but do not
    // worry — the loader will be passed into the adapter later on in this guide.
    this.loader = loader;
    this.xhr = new XMLHttpRequest();
    this.options = options;
    if (options.onRequestStateChange) {
      options.onRequestStateChange({
        state: REQUEST_STATE.NOT_STARTED,
        xhr: this.xhr,
        file: null,
      });
    }
  }

  // Starts the upload process.
  upload() {
    // this.loader.file is a File object : https://developer.mozilla.org/en-US/docs/Web/API/File
    // This promise is resolved when file has been uploaded.
    return this.loader.file.then(async (file) => {
      const { blogId, postId } = Router.currentRoute.params;
      const signedPostGraph = await apolloClient.query({
        query: gql`
          query getSignedPost(
            $fileName: String!
            $blogId: String!
            $postId: String!
          ) {
            signedPost(fileName: $fileName, blogId: $blogId, postId: $postId) {
              acl
              key
              date
              signature
              url
              algorithm
              credential
              publicUrl
              policy
            }
          }
        `,
        variables: {
          fileName: file.name,
          blogId,
          postId,
        },
      });

      if (this.options.onRequestStateChange) {
        if (this.options.onRequestStateChange) {
          this.options.onRequestStateChange({
            state: REQUEST_STATE.PENDING,
            xhr: this.xhr,
            file,
          });
        }
      }

      return new Promise((resolve, reject) => {
        // Hookup an event listener to update the upload progress bar
        this.xhr.upload.addEventListener('progress', (event) => {
          this.loader.uploadTotal = event.total;
          this.loader.uploaded = event.loaded;
        });

        // Hookup a listener to listen for when the request state changes
        this.xhr.addEventListener(
          'load',
          (e) => {
            const images = {
              default: signedPost.publicUrl,
            };
            if (this.options.onRequestStateChange) {
              this.options.onRequestStateChange({
                state: REQUEST_STATE.FINISHED_OK,
                file: file,
                xhr: this.xhr,
              });
            }
            resolve(images);
          },
          false,
        );

        this.xhr.addEventListener(
          'error',
          () => {
            this.options.onRequestStateChange({
              state: REQUEST_STATE.FINISHED_ERROR,
              file: file,
              xhr: this.xhr,
            });
            reject('Upload failed');
          },
          false,
        );

        // Setup the form data to be sent in the request
        const { signedPost } = signedPostGraph.data;
        var fd = new FormData();
        fd.append('acl', signedPost.acl);
        fd.append('key', signedPost.key);
        fd.append('x-amz-date', signedPost.date);
        fd.append('x-amz-credential', signedPost.credential);
        fd.append('x-amz-algorithm', signedPost.algorithm);
        fd.append('x-amz-signature', signedPost.signature);
        fd.append('Policy', signedPost.policy);
        fd.append('file', file);

        this.xhr.open('POST', signedPost.url, true);
        this.xhr.send(fd);
      });
    });
  }

  // Aborts the upload process.
  abort() {
    alert('aborted');
  }
}

export const ckeditorAWSDirectUploadAdapterPlugin = (options) => (editor) => {
  editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
    return new ckeditorAWSDirectUploadAdapter(loader, options);
  };
};
