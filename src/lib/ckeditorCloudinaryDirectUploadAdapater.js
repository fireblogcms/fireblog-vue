import Router from "../router";

class ckeditorCloudinaryDirectUploadAdapater {
  constructor(loader) {
    // The file loader instance to use during the upload. It sounds scary but do not
    // worry — the loader will be passed into the adapter later on in this guide.
    this.loader = loader;
    this.cloudName = "pod-cloud";
    this.unsignedUploadPreset = "ml_default";
    this.uploadUrl = `https://api.cloudinary.com/v1_1/${
      this.cloudName
    }/image/upload`;
    this.xhr = new XMLHttpRequest();
  }

  // Starts the upload process.
  upload() {
    // Each image is uploaded in a folder name after the blog Id, so
    // make sure we have a blogId param at this point.
    if (!Router.currentRoute.params.blogId) {
      throw new Error(
        "ckeditorUploadAdapter : No blog Id detected in the current url, aborting upload !"
      );
    }

    // this.loader.file is a File object : https://developer.mozilla.org/en-US/docs/Web/API/File
    // This promise is resolved when file has been uploaded.
    return this.loader.file.then(file => {
      return new Promise((resolve, reject) => {
        var fd = new FormData();
        var url =
          "https://api.cloudinary.com/v1_1/" + this.cloudName + "/upload";
        this.xhr.open("POST", url, true);
        this.xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        // Hookup an event listener to update the upload progress bar
        this.xhr.upload.addEventListener("progress", e => {
          this.loader.uploadTotal = 100;
          this.loader.uploaded = Math.round((e.loaded * 100) / e.total);
        });
        // Hookup a listener to listen for when the request state changes
        this.xhr.onreadystatechange = () => {
          if (this.xhr.readyState === 4 && this.xhr.status === 200) {
            // Successful upload, resolve the promise with the new image
            var response = JSON.parse(this.xhr.responseText);
            const images = {
              default: response.secure_url
            };
            resolve(images);
          } else if (this.xhr.status !== 200) {
            // Unsuccessful request, reject the promise
            reject("Upload failed");
          }
        };
        // Setup the form data to be sent in the request
        fd.append("upload_preset", this.unsignedUploadPreset);
        fd.append("file", file);
        this.xhr.send(fd);
      });
    });
  }

  // Aborts the upload process.
  abort() {
    alert("aborted");
  }
}

export function ckeditorCloudinaryDirectUploadAdapaterPlugin(editor) {
  editor.plugins.get("FileRepository").createUploadAdapter = loader => {
    return new ckeditorCloudinaryDirectUploadAdapater(loader);
  };
}
