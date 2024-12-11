/// <reference types="cypress" />
Cypress.Commands.add("login", (email: string, password: string) => {
  cy.get("[data-cy='email-input'] input").type(email);
  cy.get("[data-cy='password-input'] input").type(password);

  cy.get("form[data-cy='login-form']").submit();
});

Cypress.Commands.add("logout", () => {
  cy.get("[data-cy='logout-btn']").click();
});

Cypress.Commands.add("goToLogin", () => {
  cy.viewport(1024, 600);
  cy.visit("/");
  cy.get("[data-cy='login-btn']").click();
});

Cypress.Commands.add("goToMenu", (item: "dashboard" | "content") => {
  cy.get(`[data-cy='item-${item}']`).click();
});
