import useCypressInterceptors from "../../utils/interceptors";
import useCypressAssertions from "../../utils/assertions";

const { loginAdminInterceptor, getBadgeList } = useCypressInterceptors();
const { assertBadgeDetailsIs, assertToastMessageIs } = useCypressAssertions();

describe("Display badge list", () => {
  beforeEach(() => {
    cy.goToLogin();
    loginAdminInterceptor("myemail@gmail.com", "myAmazing@password");
    cy.wait("@login");
  });

  afterEach(() => {
    cy.logout();
  });

  it("should display an empty list when there is no content", () => {
    cy.intercept(
      {
        method: "GET",
        https: true,
        url: "**/rest/v1/badges?select=badge_id%2Cname%2Cdescription",
      },
      {
        statusCode: 200,
        body: [],
      },
    ).as("empty-badge-list");

    cy.goToMenu("badges");
    cy.wait("@empty-badge-list");

    cy.get("[data-cy='no-content']")
      .should("be.visible")
      .should("have.text", "No badge created yet.");
  });

  it("should display an error message when the request fails", () => {
    cy.intercept(
      {
        method: "GET",
        https: true,
        url: "**/rest/v1/badges?select=badge_id%2Cname%2Cdescription",
      },
      {
        statusCode: 404,
        body: {
          error_code: "Nothing",
          message: "Request failed",
        },
      },
    ).as("failed-badge-list");

    cy.goToMenu("badges");
    cy.wait("@failed-badge-list");

    cy.get("[data-cy='no-content']")
      .should("be.visible")
      .should("have.text", "No badge created yet.");

    assertToastMessageIs("Request to retrieve list of badges failed.");
  });

  it("should display the list of badge when presents", () => {
    const asOptions = false;
    getBadgeList(asOptions);

    cy.goToMenu("badges");
    cy.wait("@badge-list");

    cy.get("[data-cy='empty-badge-list']").should("not.exist");
    cy.get("[data-cy='badge']").should("have.length", 4);

    assertBadgeDetailsIs(
      "c87b0e34-bba7-4b69-ae54-47121b0c09df",
      "badge 0",
      "My description 0",
    );
    assertBadgeDetailsIs(
      "0d4c042f-2d58-47bb-bf01-2d335fb20fce",
      "badge 1",
      "My description 1",
    );
    assertBadgeDetailsIs(
      "ae702114-f526-4cbd-a45a-985f49427ba2",
      "badge 2",
      "My description 2",
    );
    assertBadgeDetailsIs(
      "0673c3cc-4fd0-42a2-ab53-525dc1184251",
      "badge 3",
      "My description 3",
    );
  });
});
