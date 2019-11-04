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
  constructor(loader, options, editor) {
    this.loader = loader;
    this.xhr = new XMLHttpRequest();
    this.options = options;

    editor.model.document.once('change:data', (eventInfo, batch) => {
      let imageOperation;
      for (
        let operationIndex = 0;
        !imageOperation && operationIndex < batch.operations.length;
        operationIndex += 1
      ) {
        const operation = batch.operations[operationIndex];
        if (operation.type === 'insert' && operation.nodes) {
          if (operation.nodes._nodes.find((node) => node.name === 'image')) {
            imageOperation = operation;
          }
        }
      }

      if (!imageOperation) return;

      // 1. the added image can be found in "nodeAfter", dunno why yet
      //    but we will accept this and take it as granted!
      // 2. if there is no sibling, then we are in the document end
      // 3. if we are in the document end we should add an empty paragraph
      if (!imageOperation.position.nodeAfter.nextSibling) {
        editor.model.change((writer) => {
          writer.insertElement(
            'paragraph',
            imageOperation.position.root,
            'end',
          );
        });
      }
    });

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
      const { blogId } = Router.currentRoute.params;
      const uploadLink = await apolloClient.query({
        query: gql`
          mutation CreateUploadLink($fileName: String!, $blogId: String!) {
            createUploadLink(fileName: $fileName, blogId: $blogId) {
              url
              aws {
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
          blogId,
        },
      });
      const { url, aws } = uploadLink.data.createUploadLink;

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
        fd.append('acl', aws.acl);
        fd.append('key', aws.key);
        fd.append('x-amz-date', aws.date);
        fd.append('x-amz-credential', aws.credential);
        fd.append('x-amz-algorithm', aws.algorithm);
        fd.append('x-amz-signature', aws.signature);
        fd.append('Policy', aws.policy);
        fd.append('file', file);

        this.xhr.open('POST', aws.url, true);
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
    return new ckeditorAWSDirectUploadAdapter(loader, options, editor);
  };
};
