import apolloClient from "./apolloClient";
import gql from "graphql-tag";
import slug from "slug";

export const REQUEST_STATE = {
  NOT_STARTED: "NOT_STARTED",
  PENDING: "PENDING",
  FINISHED_OK: "FINISHED_OK",
  FINISHED_ERROR: "FINISHED_ERROR"
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
export function createSlug(value, options) {
  return slug(value, {
    ...options,
    replacement: "-",
    lower: true
  });
}

/**
 * Get full user from our database.
 */
let userCache = null;
export function getUser() {
  if (userCache) {
    return Promise.resolve(userCache);
  }
  return apolloClient
    .query({
      query: gql`
        query getUser {
          me {
            _id
            name
            email
            createdAt
            updatedAt
            picture
            blogsMemberships {
              roles
              blog {
                _id
                name
              }
            }
            blogs(last: 100) {
              edges {
                node {
                  _id
                  name
                  description
                  createdAt
                  updatedAt
                  contentDefaultLocale
                }
              }
            }
          }
        }
      `
    })
    .then(result => {
      if (result.data.me === null) {
        throw new Error("No logged in user found");
      }
      return result.data.me;
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

export function getBlog(id) {
  const cache = {};
  if (cache.id) {
    return Promise.resolve(cache.id);
  }
  return apolloClient
    .query({
      query: gql`
        query loadBlogQuery($_id: ID!) {
          blog(_id: $_id) {
            _id
            contentDefaultLocale
            description
            name
            webhooks {
              name
              onEvents
              url
            }
          }
        }
      `,
      variables: {
        _id: id
      }
    })
    .then(r => {
      cache.id = r.data.blog;
      return r.data.blog;
    });
}

export function getPost(id) {
  const cache = {};
  if (cache.id) {
    return Promise.resolve(cache.id);
  }
  return apolloClient
    .query({
      query: gql`
        query getPostQuery($_id: ID!) {
          post(_id: $_id) {
            _id
            slug
            content
            publishedAt
            author {
              name
              email
            }
          }
        }
      `,
      variables: {
        _id: id
      }
    })
    .then(r => {
      cache.id = r.data.post;
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

/**
 * Helper to handle correctly form values in Vue component
 * 1 - initialFormValues are the value loaded initially for the form. They never
 *  change during the lifetime of the form.
 * 2 - current values are the user modified values. This are the values we want
 *  to submit to our API.
 * @param {*} param0
 */
export function formInitData({ initialFormValues }) {
  return {
    errors: {},
    values: {
      initial: {
        ...initialFormValues
      },
      current: {
        ...initialFormValues
      }
    }
  };
}

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
