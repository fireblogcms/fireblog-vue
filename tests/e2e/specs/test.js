// https://docs.cypress.io/api/introduction/api.html

describe("My First Test", () => {
  it("Visits the ping page url", () => {
    cy.visit("/test");
    cy.contains("h1", "Test");
  });
});
