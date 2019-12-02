import gql from "graphql-tag";

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
  ${FullPostFragment}
  query getPostQuery($_id: ID!) {
    post(_id: $_id) {
      ...FullPostFragment
    }
  }
`;

export const getPostsByStatusQuery = gql`
  ${FullPostFragment}
  query getPostsByStatusQuery($blog: ID!, $status: PostPublicationStatus!) {
    posts(filter: { blog: $blog, status: $status }, last: 100) {
      edges {
        node {
          ...FullPostFragment
        }
      }
    }
  }
`;

/**
 * We need to know if this is the first post for this blog.
 */
export const getPostsQuery = gql`
  ${FullPostFragment}
  query getPostsQuery($blog: ID!, $last: Int) {
    posts(filter: { blog: $blog }, last: $last) {
      edges {
        node {
          ...FullPostFragment
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
  mutation createBlogMutation($blog: CreateBlogInput!) {
    createBlog(blog: $blog) {
      _id
      name
      description
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
  mutation($_id: ID!) {
    deleteBlog(_id: $_id) {
      _id
      name
      status
      description
      deletedAt
    }
  }
`;
