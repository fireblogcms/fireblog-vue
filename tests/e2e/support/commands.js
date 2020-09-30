let TOKEN;

// From https://auth0.com/blog/end-to-end-testing-with-cypress-and-auth0/
Cypress.Commands.add("login", () => {
  if (TOKEN) {
    window.localStorage.setItem("token", TOKEN);
  }

  Cypress.log({
    name: "loginViaAuth0",
  });

  const options = {
    method: "POST",
    url: `https://${Cypress.env("VUE_APP_AUTH0_DOMAIN")}/oauth/token`,
    body: {
      grant_type: "password",
      username: Cypress.env("CYPRESS_AUTH0_USERNAME"),
      password: Cypress.env("CYPRESS_AUTH0_PASSWORD"),
      audience: Cypress.env("VUE_APP_AUTH0_AUDIENCE"),
      client_id: Cypress.env("VUE_APP_AUTH0_CLIENTID"),
      scope: "openid",
      client_secret: Cypress.env("CYPRESS_AUTH0_SECRET"),
      connection: "Username-Password-Authentication",
    },
  };

  cy.request(options)
    .then(({ body }) => body)
    .then(({ access_token }) =>
      cy
        .request({
          method: "POST",
          url: Cypress.env("VUE_APP_GRAPHQL_URL"),
          body: {
            query: `
            mutation syncAuth0UserWithServer {
              syncAuth0User {
                _id
              }
            }
          `,
          },
          headers: {
            authorization: `Bearer ${access_token}`,
          },
        })
        .then(() => {
          window.localStorage.setItem("token", access_token);
          TOKEN = access_token;
        })
    );
});
