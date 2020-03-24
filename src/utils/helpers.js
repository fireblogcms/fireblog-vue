import apolloClient from "./apolloClient";
import {
  createUploadPolicyMutation,
  createStripeCheckoutSessionMutation
} from "./queries";
import slug from "slug";
import {
  getUserQuery,
  getBlogQuery,
  getMyBlogsQuery,
  getPostQuery
} from "./queries";
import Store from "../store";

export const REQUEST_STATE = {
  NOT_STARTED: "NOT_STARTED",
  PENDING: "PENDING",
  FINISHED_OK: "FINISHED_OK",
  FINISHED_ERROR: "FINISHED_ERROR",
  ABORTED: "ABORTED"
};

export function getCloudinaryBlogFolderPath(blogId) {
  return `${process.env.VUE_APP_CLOUDINARY_ROOT_FOLDER}/BLOGS/${blogId}`;
}

export function cloudinaryUploadImage({ file, folder, options = {} }) {
  if (!file) {
    throw new Error("cloudinaryUploadImage(): missing file argument");
  }
  if (!folder) {
    throw new Error("cloudinaryUploadImage(): missing folder argument");
  }
  const cloudName = process.env.VUE_APP_CLOUDINARY_CLOUD_NAME;
  const unsignedUploadPreset =
    process.env.VUE_APP_CLOUDINARY_UNSIGNED_UPLOAD_PRESET;
  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const xhr = new XMLHttpRequest();

  if (options.onRequestStateChange) {
    options.onRequestStateChange({
      state: REQUEST_STATE.NOT_STARTED,
      xhr,
      file: null
    });
  }
  return new Promise((resolve, reject) => {
    var formData = new FormData();

    xhr.open("POST", uploadUrl, true);
    // Hookup an event listener to update the upload progress bar
    xhr.upload.addEventListener("progress", event => {
      if (options.onProgress)
        options.onProgress({
          total: event.total,
          loaded: event.loaded,
          percentage: (event.loaded * 100) / event.total
        });
    });

    // Hookup a listener to listen for when the request state changes
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && xhr.status === 200) {
        // Successful upload, resolve the promise with the new image
        var response = JSON.parse(xhr.responseText);
        const images = {
          default: response.secure_url
        };
        if (options.onRequestStateChange) {
          options.onRequestStateChange({
            state: REQUEST_STATE.FINISHED_OK,
            file,
            xhr
          });
        }
        resolve(images);
      } else if (xhr.status !== 200) {
        if (options.onRequestStateChange) {
          options.onRequestStateChange({
            state: REQUEST_STATE.FINISHED_ERROR,
            file,
            xhr
          });
        }
        // Unsuccessful request, reject the promise
        reject("Upload failed");
      }
    };

    // Setup the form data to be sent in the request
    formData.append("upload_preset", unsignedUploadPreset);
    formData.append("folder", folder);
    formData.append("file", file);
    xhr.send(formData);
  });
}

/**
 * Wrapper around slugify to ensure options consistance
 */
export function createSlug(value, options = {}) {
  return slug(value, {
    replacement: "-",
    lower: true,
    ...options
  });
}

/**
 * Get full user from our database.
 */

export function getUser() {
  return apolloClient
    .query({
      query: getUserQuery
    })
    .then(result => {
      if (result.data.me === null) {
        throw new Error("No logged in user found");
      }
      return result.data.me;
    })
    .catch(e => {
      console.log("MERDE", e);
    });
}

export function graphQLErrorsContainsCode(graphQLErrors, errorCode) {
  const result = graphQLErrors.some(error => {
    if (
      error.extensions &&
      error.extensions.code &&
      error.extensions.code === errorCode
    )
      return true;
  });
  return result;
}

export function getMyBlogs() {
  return apolloClient
    .query({
      query: getMyBlogsQuery
    })
    .then(r => {
      return r.data.me.blogs;
    });
}

export function getBlog(id) {
  return apolloClient
    .query({
      query: getBlogQuery,
      variables: {
        _id: id
      }
    })
    .then(r => {
      return r.data.blog;
    });
}

export function getPost(id) {
  return apolloClient
    .query({
      query: getPostQuery,
      variables: {
        _id: id
      }
    })
    .then(r => {
      return r.data.post;
    });
}

export const parseHeaders = rawHeaders => {
  const headers = new Headers();
  // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
  // https://tools.ietf.org/html/rfc7230#section-3.2
  const preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, " ");
  preProcessedHeaders.split(/\r?\n/).forEach(line => {
    const parts = line.split(":");
    const key = parts.shift().trim();
    if (key) {
      const value = parts.join(":").trim();
      headers.append(key, value);
    }
  });
  return headers;
};

export const uploadFetch = (url, options) =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      const opts = {
        status: xhr.status,
        statusText: xhr.statusText,
        headers: parseHeaders(xhr.getAllResponseHeaders() || "")
      };
      opts.url =
        "responseURL" in xhr
          ? xhr.responseURL
          : opts.headers.get("X-Request-URL");
      const body = "response" in xhr ? xhr.response : xhr.responseText;
      resolve(new Response(body, opts));
    };
    xhr.onerror = () => {
      reject(new TypeError("Network request failed"));
    };
    xhr.ontimeout = () => {
      reject(new TypeError("Network request failed"));
    };
    xhr.open(options.method, url, true);

    Object.keys(options.headers).forEach(key => {
      xhr.setRequestHeader(key, options.headers[key]);
    });

    if (xhr.upload) {
      xhr.upload.onprogress = progress => {
        console.log("progression", progress);
      };
      //xhr.upload.onprogress = options.onProgress;
    }

    if (options.onAbortPossible) {
      options.onAbortPossible(() => {
        xhr.abort();
      });
    }

    xhr.send(options.body);
  });

export function ckeditorIframelyMediaProvider() {
  return {
    // hint: this is just for previews. Get actual HTML codes by making API calls from your CMS
    name: "iframely previews",
    // Let iframely handle all links.
    url: /.+/,
    html: match => {
      const url = match[0];
      var iframeUrl = `//cdn.iframe.ly/api/iframe?app=1&api_key=${
        process.env.VUE_APP_IFRAMELY_API_KEY
      }&url=${encodeURIComponent(url)}`;
      // alternatively, use &key= instead of &api_key with the MD5 hash of your api_key
      // more about it: https://iframely.com/docs/allow-origins
      return (
        // If you need, set maxwidth and other styles for 'iframely-embed' class - it's yours to customize
        '<div class="iframely-embed">' +
        '<div class="iframely-responsive">' +
        "loading ..." +
        `<iframe src="${iframeUrl}" ` +
        'frameborder="0" allow="autoplay; encrypted-media" allowfullscreen>' +
        "</iframe>" +
        "</div>" +
        "</div>"
      );
    }
  };
}

export function S3GenerateUploadPolicy(file, blogId) {
  const requiredFileKeys = ["name", "size", "type"];
  requiredFileKeys.forEach(key => {
    if (!file[key]) {
      throw new Error(`${key} is missing for file argument.`);
    }
  });
  if (!blogId) {
    throw new Error("S3GenerateUploadPolicy: blogId is mandatory");
  }
  return apolloClient
    .mutate({
      mutation: createUploadPolicyMutation,
      variables: {
        blogId,
        file: {
          name: file.name,
          size: file.size,
          type: file.type
        }
      }
    })
    .then(result => {
      const policy = result.data.createUploadPolicy;
      policy.fields = JSON.parse(policy.fields);
      return policy;
    });
}

export function S3Upload({
  file,
  blogId,
  onProgress = () => {},
  onUploadStart = () => {}
}) {
  return S3GenerateUploadPolicy(file, blogId)
    .then(uploadPolicy => {
      return new Promise((resolve, reject) => {
        const formData = new FormData();

        Object.keys(uploadPolicy.fields).forEach(key => {
          formData.append(key, uploadPolicy.fields[key]);
        });
        // Actual file has to be appended last.
        formData.append("file", file);

        const xhr = new XMLHttpRequest();
        xhr.open("POST", uploadPolicy.uploadUrl, true);

        xhr.upload.onprogress = event => {
          const percentage = (event.loaded / event.total) * 100;
          onProgress({ loaded: event.loaded, total: event.total, percentage });
        };

        xhr.onload = () => {
          resolve({ fileUrl: uploadPolicy.fileUrl, uploadPolicy });
        };

        xhr.onerror = error => {
          reject(error);
        };

        xhr.send(formData);
        onUploadStart({ xhr, uploadPolicy });
      });
    })
    .catch(e => {
      console.log("fetch policy error: ", e);
    });
}

export function toast(component, message, type, options = {}) {
  component.$toasted.show(message, {
    duration: 2000,
    position: "bottom-center",
    className: `app-toast-${type}`,
    type,
    ...options
  });
}

export function appNotification(
  message,
  type = "info",
  options = {
    persistAfterRouteChange: false
  }
) {
  Store.commit("notification", { message, type, options });
}

export function resetAppNotifications() {
  Store.commit("notification", null);
}

export function validateSlug(slug) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/**
 * @param {object} date
 * @param {string} type
 */
export function formatDate(date, type) {
  if (type === "long") {
    return date.toLocaleDateString(undefined, {
      day: "numeric",
      weekday: "long",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }
}

export function createStripeCheckoutSession({
  userEmail,
  userId,
  blogId,
  planId,
  successUrl,
  cancelUrl
}) {
  return apolloClient
    .mutate({
      mutation: createStripeCheckoutSessionMutation,
      variables: {
        userEmail,
        userId,
        blogId,
        planId,
        successUrl,
        cancelUrl
      }
    })
    .then(result => {
      const sessionId = result.data.createStripeCheckoutSession.id;
      return sessionId;
    });
}
