import gql from "graphql-tag";

export const PostFragment = gql`
  fragment PostFragment on Post {
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
`;

export const getMyBlogsQuery = gql`
  query myBlogsQuery {
    me {
      _id
      name
      blogs(last: 100) {
        edges {
          node {
            _id
            name
            description
            createdAt
            updatedAt
          }
        }
      }
    }
  }
`;

export const getBlogQuery = gql`
  query getBlogQuery($_id: ID!) {
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
`;

export const getPostQuery = gql`
  ${PostFragment}
  query getPostQuery($_id: ID!) {
    post(_id: $_id) {
      ...PostFragment
    }
  }
`;

export const getPostsByStatusQuery = gql`
  ${PostFragment}
  query getPostsByStatusQuery($blog: ID!, $status: PostPublicationStatus!) {
    posts(filter: { blog: $blog, status: $status }, last: 100) {
      edges {
        node {
          ...PostFragment
        }
      }
    }
  }
`;

/**
 * We need to know if this is the first post for this blog.
 */
export const getPostsQuery = gql`
  ${PostFragment}
  query getPostsQuery($blog: ID!, $last: Int) {
    posts(filter: { blog: $blog }, last: $last) {
      edges {
        node {
          ...PostFragment
        }
      }
    }
  }
`;

export const deletePostMutation = gql`
  ${PostFragment}
  mutation deletePostMutation($id: ID!) {
    deletePost(_id: $id) {
      ...PostFragment
    }
  }
`;

export const createBlogMutation = gql`
  mutation createBlogMutation($blog: CreateBlogInput!) {
    createBlog(blog: $blog) {
      _id
      name
      description
    }
  }
`;

export const createPostMutation = gql`
  ${PostFragment}
  mutation createPostMutation($post: CreatePostInput!) {
    createPost(post: $post) {
      ...PostFragment
    }
  }
`;

export const updatePostMutation = gql`
  ${PostFragment}
  mutation updatePostMutation($post: UpdatePostInput!) {
    updatePost(post: $post) {
      ...PostFragment
    }
  }
`;
