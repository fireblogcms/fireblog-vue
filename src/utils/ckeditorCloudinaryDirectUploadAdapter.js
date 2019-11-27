import Router from "../router";
import { REQUEST_STATE, getCloudinaryBlogFolderPath } from "./helpers";

/**
 * Upload an image directly from ckEditor to Cloudinary servers with an XMLHttpRequest
 * - less CPU for our own servers
 * - Better and easier tracking of upload progress (which is critical because publishing
 * an article if a image is not 100% uploaded will result in loss of this image)
 */
class ckeditorCloudinaryDirectUploadAdapter {
  constructor(loader, options) {
    // The file loader instance to use during the upload. It sounds scary but do not
    // worry — the loader will be passed into the adapter later on in this guide.
    this.loader = loader;
    this.cloudName = process.env.VUE_APP_CLOUDINARY_CLOUD_NAME;
    this.unsignedUploadPreset =
      process.env.VUE_APP_CLOUDINARY_UNSIGNED_UPLOAD_PRESET;
    this.uploadUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;
    this.xhr = new XMLHttpRequest();
    this.options = options;
    if (options.onRequestStateChange) {
      options.onRequestStateChange({
        state: REQUEST_STATE.NOT_STARTED,
        xhr: this.xhr,
        file: null
      });
    }
  }

  // Starts the upload process.
  upload() {
    const blogId = Router.currentRoute.params.blogId;
    if (!blogId) {
      // Each image is uploaded in a folder name after the blog Id, so
      // make sure we have a blogId param at this point.
      throw new Error(
        "ckeditorUploadAdapter : No blog Id detected in the current url, aborting upload !"
      );
    }

    // this.loader.file is a File object : https://developer.mozilla.org/en-US/docs/Web/API/File
    // This promise is resolved when file has been uploaded.
    return this.loader.file.then(file => {
      if (this.options.onRequestStateChange) {
        if (this.options.onRequestStateChange) {
          this.options.onRequestStateChange({
            state: REQUEST_STATE.PENDING,
            xhr: this.xhr,
            file
          });
        }
      }
      return new Promise((resolve, reject) => {
        var formData = new FormData();

        this.xhr.open("POST", this.uploadUrl, true);
        // Hookup an event listener to update the upload progress bar
        this.xhr.upload.addEventListener("progress", event => {
          this.loader.uploadTotal = event.total;
          this.loader.uploaded = event.loaded;
        });

        // Hookup a listener to listen for when the request state changes
        this.xhr.onreadystatechange = () => {
          if (this.xhr.readyState === 4 && this.xhr.status === 200) {
            // Successful upload, resolve the promise with the new image
            var response = JSON.parse(this.xhr.responseText);
            const images = {
              default: response.secure_url
            };
            if (this.options.onRequestStateChange) {
              this.options.onRequestStateChange({
                state: REQUEST_STATE.FINISHED_OK,
                file: file,
                xhr: this.xhr
              });
            }
            resolve(images);
          } else if (this.xhr.status !== 200) {
            this.options.onRequestStateChange({
              state: REQUEST_STATE.FINISHED_ERROR,
              file: file,
              xhr: this.xhr
            });
            // Unsuccessful request, reject the promise
            reject("Upload failed");
          }
        };

        // Setup the form data to be sent in the request
        const folder = getCloudinaryBlogFolderPath(blogId);
        formData.append("upload_preset", this.unsignedUploadPreset);
        formData.append("folder", folder);
        formData.append("file", file);
        this.xhr.send(formData);
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

export const ckeditorCloudinaryDirectUploadAdapterPlugin = options => editor => {
  editor.plugins.get("FileRepository").createUploadAdapter = loader => {
    return new ckeditorCloudinaryDirectUploadAdapter(loader, options);
  };
};
