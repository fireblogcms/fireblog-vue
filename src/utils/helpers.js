import apolloClient from './apolloClient';
import Router from '../router';
import gql from 'graphql-tag';
import slug from 'slug';

export const REQUEST_STATE = {
  NOT_STARTED: 'NOT_STARTED',
  PENDING: 'PENDING',
  FINISHED_OK: 'FINISHED_OK',
  FINISHED_ERROR: 'FINISHED_ERROR',
};

export async function awsUploadImage({ file, options = {} }) {
  if (!file) {
    throw new Error('awsUploadImage(): missing file argument');
  }

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

  const xhr = new XMLHttpRequest();

  if (options.onRequestStateChange) {
    options.onRequestStateChange({
      state: REQUEST_STATE.NOT_STARTED,
      xhr,
      file: null,
    });
  }
  return new Promise((resolve, reject) => {
    // Hookup an event listener to update the upload progress bar
    xhr.upload.addEventListener('progress', (event) => {
      if (options.onProgress)
        options.onProgress({
          total: event.total,
          loaded: event.loaded,
          percentage: (event.loaded * 100) / event.total,
        });
    });

    // Hookup a listener to listen for when the request state changes
    xhr.addEventListener(
      'load',
      (e) => {
        const images = {
          default: url,
        };
        if (options.onRequestStateChange) {
          options.onRequestStateChange({
            state: REQUEST_STATE.FINISHED_OK,
            file,
            xhr,
          });
        }
        resolve(images);
      },
      false,
    );
    xhr.addEventListener(
      'error',
      () => {
        if (options.onRequestStateChange) {
          options.onRequestStateChange({
            state: REQUEST_STATE.FINISHED_ERROR,
            file,
            xhr,
          });
        }
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

    xhr.open('POST', aws.url, true);
    xhr.send(fd);
  });
}

/**
 * Wrapper around slugify to ensure options consistance
 */
export function createSlug(value, options) {
  return slug(value, {
    ...options,
    replacement: '-',
    lower: true,
  });
}

/**
 * Get full user from our database.
 */
export function getUser() {
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
          }
        }
      `,
    })
    .then((result) => {
      if (result.data.me === null) {
        throw new Error('No logged in user found');
      }
      return result.data.me;
    });
}

export function graphQLErrorsContainsCode(graphQLErrors, errorCode) {
  const result = graphQLErrors.some((error) => {
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
        _id: id,
      },
    })
    .then((r) => {
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
        _id: id,
      },
    })
    .then((r) => {
      cache.id = r.data.post;
      return r.data.post;
    });
}

export const parseHeaders = (rawHeaders) => {
  const headers = new Headers();
  // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
  // https://tools.ietf.org/html/rfc7230#section-3.2
  const preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ');
  preProcessedHeaders.split(/\r?\n/).forEach((line) => {
    const parts = line.split(':');
    const key = parts.shift().trim();
    if (key) {
      const value = parts.join(':').trim();
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
        headers: parseHeaders(xhr.getAllResponseHeaders() || ''),
      };
      opts.url =
        'responseURL' in xhr
          ? xhr.responseURL
          : opts.headers.get('X-Request-URL');
      const body = 'response' in xhr ? xhr.response : xhr.responseText;
      resolve(new Response(body, opts));
    };
    xhr.onerror = () => {
      reject(new TypeError('Network request failed'));
    };
    xhr.ontimeout = () => {
      reject(new TypeError('Network request failed'));
    };
    xhr.open(options.method, url, true);

    Object.keys(options.headers).forEach((key) => {
      xhr.setRequestHeader(key, options.headers[key]);
    });

    if (xhr.upload) {
      xhr.upload.onprogress = (progress) => {
        console.log('progression', progress);
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
        ...initialFormValues,
      },
      current: {
        ...initialFormValues,
      },
    },
  };
}

export function ckeditorIframelyMediaProvider() {
  return {
    // hint: this is just for previews. Get actual HTML codes by making API calls from your CMS
    name: 'iframely previews',
    // Let iframely handle all links.
    url: /.+/,
    html: (match) => {
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
        'loading ...' +
        `<iframe src="${iframeUrl}" ` +
        'frameborder="0" allow="autoplay; encrypted-media" allowfullscreen>' +
        '</iframe>' +
        '</div>' +
        '</div>'
      );
    },
  };
}
