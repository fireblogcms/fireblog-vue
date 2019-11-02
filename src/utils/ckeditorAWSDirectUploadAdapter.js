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
      const { postId } = Router.currentRoute.params;
      const uploadLink = await apolloClient.query({
        query: gql`
          mutation CreateUploadLink($fileName: String!, $postId: String!) {
            createUploadLink(fileName: $fileName, postId: $postId) {
              url
              uploadInfo {
                url
                acl
                key
                date
                signature
                algorithm
                credential
                policy
              }
            }
          }
        `,
        variables: {
          fileName: file.name,
          postId,
        },
      });
      const { url, uploadInfo } = uploadLink.data.createUploadLink;

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
              default: url,
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
        var fd = new FormData();
        fd.append('acl', uploadInfo.acl);
        fd.append('key', uploadInfo.key);
        fd.append('x-amz-date', uploadInfo.date);
        fd.append('x-amz-credential', uploadInfo.credential);
        fd.append('x-amz-algorithm', uploadInfo.algorithm);
        fd.append('x-amz-signature', uploadInfo.signature);
        fd.append('Policy', uploadInfo.policy);
        fd.append('file', file);

        this.xhr.open('POST', uploadInfo.url, true);
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
