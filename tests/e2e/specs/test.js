// https://docs.cypress.io/api/introduction/api.html
beforeEach(() => {
  cy.login();
  cy.visit("/");
});

describe("My First Test", () => {
  it("should display the blog create form because no blog yet", () => {
    cy.url().should("include", "/blog/create?first=1");
  });
});
