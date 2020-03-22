import gql from "graphql-tag";

import { postsPerPage } from "../config";

export const FullPostFragment = gql`
  fragment FullPostFragment on Post {
    _id
    title
    content
    status
    slug
    teaser
    image
    publishedAt
    updatedAt
    createdAt
    image
    author {
      _id
      name
      email
    }
  }
`;

export const PostListFragment = gql`
  fragment PostListFragment on Post {
    _id
    title
    status
    slug
    teaser
    image
    publishedAt
    updatedAt
    createdAt
    image
    author {
      _id
      name
      email
    }
  }
`;

export const FullBlogFragment = gql`
  fragment FullBlogFragment on Blog {
    _id
    image
    contentDefaultLocale
    description
    name
    updatedAt
    createdAt
    url
    webhooks {
      name
      onEvents
      url
    }
  }
`;

export const getUserQuery = gql`
  query getUserQuery {
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
      blogs(last: ${postsPerPage}) {
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
`;

export const getMyBlogsQuery = gql`
  ${FullBlogFragment}
  query myBlogsQuery {
    me {
      _id
      name
      blogs(last: ${postsPerPage}) {
        edges {
          node {
            ...FullBlogFragment
          }
        }
      }
    }
  }
`;

export const getBlogQuery = gql`
  ${FullBlogFragment}
  query getBlogQuery($_id: ID!) {
    blog(_id: $_id) {
      ...FullBlogFragment
    }
  }
`;

export const getPostQuery = gql`
  ${FullPostFragment}
  query getPostQuery($_id: ID!) {
    post(_id: $_id) {
      ...FullPostFragment
    }
  }
`;

/**
 * We need to know if this is the first post for this blog.
 */
export const getPostsQuery = gql`
  ${PostListFragment}
  query getPostsQuery($blog: ID!, $status: [PostPublicationStatus]!) {
    posts(blog: $blog, last: ${postsPerPage}, filter: { status: $status }) {
      totalCount
      edges {
        cursor
        node {
          ...PostListFragment
        }
      }
    }
  }
`;

export const deletePostMutation = gql`
  ${FullPostFragment}
  mutation deletePostMutation($id: ID!) {
    deletePost(_id: $id) {
      ...FullPostFragment
    }
  }
`;

export const createBlogMutation = gql`
  ${FullBlogFragment}
  mutation createBlogMutation($blog: CreateBlogInput!) {
    createBlog(blog: $blog) {
      ...FullBlogFragment
    }
  }
`;

export const savePostMutation = gql`
  ${FullPostFragment}
  mutation savePostMutation($blog: ID!, $post: savePostInput!) {
    savePost(blog: $blog, post: $post) {
      ...FullPostFragment
    }
  }
`;

export const createPostMutation = gql`
  ${FullPostFragment}
  mutation createPostMutation($post: CreatePostInput!) {
    createPost(post: $post) {
      ...FullPostFragment
    }
  }
`;

export const updatePostMutation = gql`
  ${FullPostFragment}
  mutation updatePostMutation($post: UpdatePostInput!) {
    updatePost(post: $post) {
      ...FullPostFragment
    }
  }
`;

export const updateBlogMutation = gql`
  ${FullBlogFragment}
  mutation updateBlog($blog: UpdateBlogInput!) {
    updateBlog(blog: $blog) {
      ...FullBlogFragment
    }
  }
`;

export const createUploadPolicyMutation = gql`
  mutation($file: FileInput!, $blogId: ID!) {
    createUploadPolicy(file: $file, blogId: $blogId) {
      uploadUrl
      fileUrl
      fields
    }
  }
`;

export const deleteBlogMutation = gql`
  ${FullBlogFragment}
  mutation($_id: ID!) {
    deleteBlog(_id: $_id) {
      ...FullBlogFragment
    }
  }
`;

/**
 * We need to know if this is the first post for this blog.
 */
export const getBlogApiUsageQuery = gql`
  query getBlogApiUsageQuery($blog: ID!, $from: DateTime!, $to: DateTime!) {
    apiUsage(blog: $blog, from: $from, to: $to) {
      count
      countTotal
    }
  }
`;

export const createStripeCheckoutSessionMutation = gql`
  mutation(
    $blogId: ID
    $planId: String!
    $successUrl: String!
    $cancelUrl: String!
  ) {
    createStripeCheckoutSession(
      blogId: $blogId
      planId: $planId
      successUrl: $successUrl
      cancelUrl: $cancelUrl
    ) {
      id
    }
  }
`;

export const getPricesQuery = gql`
  query getPricing {
    prices {
      planId
      planAmount
      productName
      productMetadata
    }
  }
`;
