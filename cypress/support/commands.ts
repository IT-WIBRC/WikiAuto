/// <reference types="cypress" />
Cypress.Commands.add('login', (email: string, password: string) => {
    cy.get("[data-cy='email-input'] input").type(email);
    cy.get("[data-cy='password-input'] input").type(password);

    cy.get("form[data-cy='login-form']").submit();
})
