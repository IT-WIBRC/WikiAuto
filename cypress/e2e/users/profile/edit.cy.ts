import useCypressInterceptors from "../../../utils/interceptors";
import useCypressAssertions from "../../../utils/assertions";

const { initAdminPart, PROFILE_URL } = useCypressInterceptors();
const { assertToastMessageIs } = useCypressAssertions();

describe("Edit user profile", () => {
  beforeEach(() => {
    initAdminPart();
    cy.goToMenu("profile");
  });

  afterEach(() => {
    cy.logout();
  });

  it("shows a success toast and updates the fields after saving", () => {
    cy.intercept("PATCH", PROFILE_URL.PATCH, {
      statusCode: 200,
      body: {
        firstname: "Jane",
        lastname: "Doe",
        username: "IT-WIBRC",
      },
    }).as("updateProfile");

    cy.get("[data-cy='save-btn']").should("be.disabled");

    cy.get("[data-cy='profile-section']").within(() => {
      cy.get("[data-cy='firstname'] input").clear().type("Jane");

      cy.get("[data-cy='save-btn']").should("not.be.disabled");
      cy.get("[data-cy='save-btn']").click();
    });

    cy.wait("@updateProfile");

    assertToastMessageIs("Changes saved successfully");

    cy.get("[data-cy='profile-section']").within(() => {
      cy.get("[data-cy='save-btn']").should("be.disabled");
      cy.get("[data-cy='firstname'] input").should("have.value", "Jane");
    });
  });

  it("shows an error toast if the update fails", () => {
    cy.intercept("PATCH", PROFILE_URL.PATCH, {
      statusCode: 500,
      body: {
        status: "error",
        message: "SERVER_ERROR",
      },
    }).as("updateProfile");

    cy.get("[data-cy='profile-section']").within(() => {
      cy.get("[data-cy='firstname'] input").clear().type("Jane");
      cy.get("[data-cy='save-btn']").click();
    });

    cy.wait("@updateProfile");

    assertToastMessageIs(
      "Sorry we encountered a server problem, try again later!",
    );
  });
});
