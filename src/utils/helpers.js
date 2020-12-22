import apolloClient from "./apolloClient";
import gql from "graphql-tag";
import {
  createUploadPolicyMutation,
  createStripeCheckoutSessionMutation,
} from "./queries";
import {
  getUserQuery,
  getBlogQuery,
  getMyBlogsQuery,
  getPlanQuery,
  getPostQuery,
} from "./queries";

export const REQUEST_STATE = {
  NOT_STARTED: "NOT_STARTED",
  PENDING: "PENDING",
  FINISHED_OK: "FINISHED_OK",
  FINISHED_ERROR: "FINISHED_ERROR",
  ABORTED: "ABORTED",
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
      file: null,
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
          percentage: (event.loaded * 100) / event.total,
        });
    });

    // Hookup a listener to listen for when the request state changes
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && xhr.status === 200) {
        // Successful upload, resolve the promise with the new image
        var response = JSON.parse(xhr.responseText);
        const images = {
          default: response.secure_url,
        };
        if (options.onRequestStateChange) {
          options.onRequestStateChange({
            state: REQUEST_STATE.FINISHED_OK,
            file,
            xhr,
          });
        }
        resolve(images);
      } else if (xhr.status !== 200) {
        if (options.onRequestStateChange) {
          options.onRequestStateChange({
            state: REQUEST_STATE.FINISHED_ERROR,
            file,
            xhr,
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
    ...options,
  });
}

export function generateSlugFromServer({ blogId, source }) {
  return apolloClient
    .mutate({
      variables: {
        blogId,
        source,
      },
      mutation: gql`
        mutation generateBlogPostSlug($source: String!, $blogId: ID!) {
          generateBlogPostSlug(blogId: $blogId, source: $source) {
            source
            slug
            alreadyExists
            usedByPost {
              _id
              slug
              title
            }
          }
        }
      `,
    })
    .then(response => {
      return response.data.generateBlogPostSlug;
    });
}

/**
 * Get full user from our database.
 */

export function getUser() {
  return apolloClient
    .query({
      query: getUserQuery,
    })
    .then(result => {
      if (result.data.me === null) {
        throw new Error("No logged in user found");
      }
      return result.data.me;
    })
    .catch(e => {
      console.log("User login error", e);
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
      query: getMyBlogsQuery,
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
        _id: id,
      },
    })
    .then(r => {
      return r.data.blog;
    });
}

export function getPlan(planId) {
  return apolloClient
    .query({
      query: getPlanQuery,
      variables: {
        planId: planId,
      },
    })
    .then(r => {
      return r.data.plan;
    });
}

export function getPost(id) {
  return apolloClient
    .query({
      query: getPostQuery,
      variables: {
        _id: id,
      },
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
        `<iframe src="${iframeUrl}" ` +
        'frameborder="0" allow="autoplay; encrypted-media" allowfullscreen>' +
        "</iframe>" +
        "</div>" +
        "</div>"
      );
    },
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
          type: file.type,
        },
      },
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
  onUploadStart = () => {},
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
    ...options,
  });
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
      minute: "2-digit",
    });
  }
  if (type === "ddMyyyyhhmm") {
    return date.toLocaleDateString(undefined, {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  if (type === "shortWithTime") {
    return date.toLocaleDateString(undefined, {
      day: "numeric",
      month: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}

export function createStripeCheckoutSession({
  userEmail,
  userId,
  customerId,
  blogSetId,
  planId,
  successUrl,
  cancelUrl,
}) {
  return apolloClient
    .mutate({
      mutation: createStripeCheckoutSessionMutation,
      variables: {
        userEmail,
        userId,
        customerId,
        blogSetId,
        planId,
        successUrl,
        cancelUrl,
      },
    })
    .then(result => {
      const sessionId = result.data.createStripeCheckoutSession.id;
      return sessionId;
    });
}

/**
 * Select a random GIF, but do not displayt twice the same gif
 *
 * @param {array} gifsArray : an array of gifs urls
 * @return {string} a single gif url
 */
let previousDisplayedGif = null;
export function getRandomGif(gifsArray) {
  // a security to avoid an infinite loop below: if there is only
  // one gif; we have no way to display another gif than the previous one.
  if (gifsArray.length === 1) {
    return gifsArray[0];
  }
  const randomIndex = () => Math.floor(Math.random() * gifsArray.length);
  let gif = gifsArray[randomIndex()];
  if (!gif) {
    console.error("getRandomGif() : no gif returned");
    return;
  }
  // make sure we do not display twice the same gif
  if (gif === previousDisplayedGif) {
    while (gif == previousDisplayedGif) {
      gif = gifsArray[randomIndex()];
    }
  }
  previousDisplayedGif = gif;
  return gif;
}

/**
 * Return current time with format hh:mm
 */
export function getTimeFromDateString(date = null) {
  function prefixZero(i) {
    if (i < 10) {
      i = "0" + i;
    }
    return i;
  }
  function time() {
    var today = date ? new Date(date) : new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    // add a zero in front of numbers<10
    h = prefixZero(h);
    m = prefixZero(m);
    return h + ":" + m;
  }
  return time();
}

/**
 * @param date string
 * @param time string hh:mm
 * @return Date object
 */
export function combineDateAndTime(date, time) {
  let timeExploded = time.split(":");
  let datetime = new Date(date);
  datetime.setHours(timeExploded[0], timeExploded[1]);
  return datetime;
}
