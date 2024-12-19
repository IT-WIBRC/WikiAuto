import useCypressInterceptors from "../../utils/interceptors";
import useCypressAssertions from "../../utils/assertions";

const { loginAdminInterceptor } = useCypressInterceptors();
const { assertTableHeadersAre, assertTableRowHas } = useCypressAssertions();

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
        url: "**/rest/v1/contents?select=content_id%2Cstatus%2Ctitle%2Cuser_email%2Cupdated_at%2Cbadges%28name%29",
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
        url: "**/rest/v1/contents?select=content_id%2Cstatus%2Ctitle%2Cuser_email%2Cupdated_at%2Cbadges%28name%29",
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

    cy.clock();
    cy.tick(5000);

    cy.get("[data-test='message']")
      .should("be.visible")
      .should("have.text", "Request to retrieve list of contents failed.");

    cy.tick(15000);
    cy.clock().invoke("restore");
  });

  it("should display the list of content when presents", () => {
    cy.intercept(
      {
        method: "GET",
        https: true,
        url: "**/rest/v1/contents?select=content_id%2Cstatus%2Ctitle%2Cuser_email%2Cupdated_at%2Cbadges%28name%29",
      },
      {
        statusCode: 200,
        body: [
          {
            content_id: "326121c5-099e-4918-a551-a7289642e130",
            status: "Validated",
            title: "My title",
            user_email: "email@email.com",
            badges: [
              {
                name: "badge 1",
              },
            ],
            updated_at: "2024-12-14 18:45:28"
          },
          {
            content_id: "b3cacd2b-7ee3-4c84-a6bf-52742de57ab0",
            status: "Validated",
            title: "My title 2",
            user_email: "email2@email.com",
            badges: [
              {
                name: "badge 10",
              },
              {
                name: "badge 11",
              },
              {
                name: "badge 12",
              },
            ],
            updated_at: "2024-12-18 13:25:08"
          },
        ],
      },
    ).as("content-list");

    cy.goToMenu("content");
    cy.wait("@content-list");

    cy.get("[data-cy='no-content']").should("not.exist");
    cy.get("[data-cy='table-row']").should("have.length", 2);

    assertTableHeadersAre(["Title", "Email", "Badges", "Status"]);

    assertTableRowHas({
      id: "326121c5-099e-4918-a551-a7289642e130",
      badges: ["badge 1"],
      email: "email@email.com",
      title: "My title",
      status: "Validated",
    });

    assertTableRowHas({
      id: "b3cacd2b-7ee3-4c84-a6bf-52742de57ab0",
      badges: ["badge 10", "badge 11", "badge 12"],
      email: "email2@email.com",
      title: "My title 2",
      status: "Validated",
    });
  });
});
