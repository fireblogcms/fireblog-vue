import { REQUEST_STATE, S3Upload } from "./helpers";
import Router from "../router";

/**
 * Upload an image directly from ckEditor to S3 servers with an XMLHttpRequest
 * - less CPU for our own servers
 * - Better and easier tracking of upload progress (which is critical because publishing
 * an article if a image is not 100% uploaded will result in loss of this image)
 */
class ckeditorS3UploadAdapter {
  constructor(loader, options) {
    // The file loader instance to use during the upload. It sounds scary but do not
    // worry — the loader will be passed into the adapter later on in this guide.
    this.loader = loader;
    this.options = options;
    this.xhr = null;

    if (this.options.onRequestStateChange) {
      options.onRequestStateChange({
        state: REQUEST_STATE.NOT_STARTED,
        xhr: this.xhr,
        file: null
      });
    }
  }

  // Starts the upload process.
  upload() {
    if (!this.options.blogId) {
      // Each image is uploaded attached to blog Id, so
      // make sure we have a blogId param at this point.
      throw new Error(
        "ckeditorUploadAdapter : No blog Id detected in the current url, aborting upload !"
      );
    }
    const blogId = this.options.blogId;
    return this.loader.file.then(file => {
      return S3Upload({
        blogId,
        file,
        onUploadStart: ({ xhr }) => {
          this.xhr = xhr;
          // Hookup an event listener to update the upload progress bar
          this.xhr.upload.addEventListener("progress", event => {
            this.loader.uploadTotal = event.total;
            this.loader.uploaded = event.loaded;
          });
        }
      })
        .then(({ fileUrl }) => {
          this.options.onRequestStateChange({
            state: REQUEST_STATE.FINISHED_OK,
            xhr: this.xhr,
            file: null
          });
          const images = {
            default: fileUrl
          };
          return images;
        })
        .catch(error => {
          this.options.onRequestStateChange({
            state: REQUEST_STATE.FINISHED_ERROR,
            xhr: this.xhr,
            file: null,
            error
          });
        });
    });
  }

  // Aborts the upload process.
  abort() {
    this.xhr.abort();
    this.options.onRequestStateChange({
      state: REQUEST_STATE.ABORTED,
      xhr: this.xhr,
      file: null
    });
  }
}

export const ckeditorS3UploadAdapterPlugin = options => editor => {
  editor.plugins.get("FileRepository").createUploadAdapter = loader => {
    return new ckeditorS3UploadAdapter(loader, options);
  };
};
