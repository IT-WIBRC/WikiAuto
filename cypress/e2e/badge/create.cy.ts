import useCypressInterceptors from "../../utils/interceptors";
import useCypressAssertions from "../../utils/assertions";

const { getBadgeList, initAdminPart } = useCypressInterceptors();
const { assertToastMessageIs } = useCypressAssertions();

describe("Create badge", () => {
  beforeEach(() => {
    initAdminPart();
  });

  it("should create the tag successfully", () => {
    cy.intercept(
      {
        method: "GET",
        https: true,
        url: "**/rest/v1/badges?select=*",
      },
      {
        statusCode: 200,
        body: [],
      },
    ).as("empty-badge-list");

    cy.goToMenu("badges");
    cy.wait("@empty-badge-list");

    cy.get("[data-cy='empty-badge-list']").should("exist");

    cy.get("[data-cy='go-to-badge-create']").should(
      "have.text",
      "Create a badge",
    );
    cy.get("[data-cy='go-to-badge-create']").click();

    cy.intercept(
      {
        method: "POST",
        https: true,
        url: "**/rest/v1/badges",
      },
      {
        statusCode: 201,
        body: [],
      },
    ).as("create-badge");

    const asOptions = false;
    getBadgeList(asOptions);

    fillBadgeForm("My test title", "My test description");

    cy.wait("@create-badge").should(({ request }) => {
      expect(request.body.name).to.equals("My test title");
      expect(request.body.description).to.equals("My test description");
    });

    assertToastMessageIs("Created successfully");

    cy.wait("@badge-list");

    cy.logout();
  });

  it("should display an error message as toast when the creation failed", () => {
    const asOptions = false;
    getBadgeList(asOptions);

    cy.goToMenu("badges");
    cy.wait("@badge-list");

    cy.get("[data-cy='empty-badge-list']").should("not.exist");
    cy.get("[data-cy='badge']").should("have.length", 4);

    cy.get("[data-cy='go-to-badge-create']").click();

    cy.intercept(
      {
        method: "POST",
        https: true,
        url: "**/rest/v1/badges",
      },
      {
        statusCode: 409,
        body: {
          code: "40905",
          message: "Request failed",
        },
      },
    ).as("failed-create-badge");

    const notAsOptions = true;
    getBadgeList(notAsOptions);

    fillBadgeForm("My test title", "My test description");

    cy.wait("@failed-create-badge").should(({ request }) => {
      expect(request.body.name).to.equals("My test title");
      expect(request.body.description).to.equals("My test description");
    });

    assertToastMessageIs("Failed to create");
  });

  const fillBadgeForm = (name: string, description: string): void => {
    cy.get("[data-cy='field-title-input'] input").type(name);
    cy.get("[data-cy='field-description-input'] input").type(description);

    cy.get("[data-cy='create-badge-btn']").click();
  };
});
