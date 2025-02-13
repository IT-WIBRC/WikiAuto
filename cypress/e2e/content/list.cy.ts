import useCypressInterceptors from "../../utils/interceptors";
import useCypressAssertions from "../../utils/assertions";

const { loginAdminInterceptor, content } = useCypressInterceptors();
const { assertTableHeadersAre, assertTableRowHas, assertToastMessageIs } =
  useCypressAssertions();

const Content = content();
describe("Display content list", () => {
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
        url: Content.GET_LIST_URL,
      },
      {
        statusCode: 200,
        body: [],
      },
    ).as("empty-content-list");

    cy.goToMenu("content");
    cy.wait("@empty-content-list");

    cy.get("[data-cy='no-content']")
      .should("be.visible")
      .should("have.text", "No content created yet.");
  });

  it("should display an error message when the request fails", () => {
    cy.intercept(
      {
        method: "GET",
        https: true,
        url: Content.GET_LIST_URL,
      },
      {
        statusCode: 404,
        body: {
          error_code: "Nothing",
          message: "Request failed",
        },
      },
    ).as("failed-content-list");

    cy.goToMenu("content");
    cy.wait("@failed-content-list");

    cy.get("[data-cy='no-content']")
      .should("be.visible")
      .should("have.text", "No content created yet.");

    assertToastMessageIs("Request to retrieve list of contents failed.");
  });

  it("should display the list of content when presents", () => {
    Content.getListSuccessfullyInterceptor();

    cy.goToMenu("content");
    cy.wait("@content-list");

    cy.get("[data-cy='no-content']").should("not.exist");
    cy.get("[data-cy='table-row']").should("have.length", 2);

    assertTableHeadersAre(["Title", "Created by", "Badges", "Status"], 5);

    assertTableRowHas({
      id: "426121c5-099e-4918-a551-a7289642e130",
      badges: ["badge 1"],
      email: "email@email.com",
      title: "Wear your seatbelt",
      status: "VALIDATED",
    });

    assertTableRowHas({
      id: "a3cacd2b-7ee3-4c84-a6bf-52742de57ab0",
      badges: ["badge 10", "badge 11"],
      remaining: "+1",
      email: "email2@email.com",
      title: "Avoid driving while tired",
      status: "PENDING",
    });
  });
});
