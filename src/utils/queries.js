import gql from "graphql-tag";

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
  query getPostQuery($_id: ID!) {
    post(_id: $_id) {
      _id
      slug
      content
      publishedAt
      author {
        _id
        name
        email
      }
    }
  }
`;

export const getPostsByStatusQuery = gql`
  query getPostsByStatusQuery($blog: ID!, $status: PostPublicationStatus!) {
    posts(filter: { blog: $blog, status: $status }, last: 100) {
      edges {
        node {
          _id
          title
          updatedAt
          createdAt
          publishedAt
          status
          content
          teaser
          image
          author {
            _id
            name
            email
          }
        }
      }
    }
  }
`;

/**
 * We need to know if this is the first post for this blog.
 */
export const getPostsQuery = gql`
  query getPostsQuery($blog: ID!, $last: Int) {
    posts(filter: { blog: $blog }, last: $last) {
      edges {
        node {
          _id
          title
          updatedAt
          createdAt
          publishedAt
          status
          content
          teaser
          image
          author {
            _id
            name
            email
          }
        }
      }
    }
  }
`;

export const deletePostMutation = gql`
  mutation deletePostMutation($id: ID!) {
    deletePost(_id: $id) {
      _id
      slug
      title
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
