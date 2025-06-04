import useCypressInterceptors from "../../../utils/interceptors";

const { initAdminPart } = useCypressInterceptors();

describe("Display user profile", () => {
  beforeEach(() => {
    initAdminPart();
    cy.goToMenu("profile");
  });

  afterEach(() => {
    cy.logout();
  });

  it("should display the user profile", () => {
    cy.get("[data-cy='user-profile-title']")
      .should("be.visible")
      .should("have.text", "User Profile Management");

    cy.get("[data-cy='profile-section']").should("be.visible");

    cy.get("[data-cy='profile-section']").within(() => {
      cy.get("[data-cy='firstname'] input").should("have.value", "John");
      cy.get("[data-cy='lastname'] input").should("have.value", "Doe");
      cy.get("[data-cy='username'] input").should("have.value", "IT-WIBRC");
      cy.get("[data-cy='email'] input")
        .should("have.value", "myemail@gmail.com")
        .should("be.disabled");
      cy.get("[data-cy='save-btn']")
        .should("be.disabled")
        .should("have.text", "Save changes");
    });
  });
});
