export default ({ _id }) => `
  {
    post(_id: "${_id}") {
      slug
      title
      content
      publishedAt
      author {
        name
        email
        picture
      }
    }
  }
`;
