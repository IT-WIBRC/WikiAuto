import useCypressInterceptors from "../utils/interceptors";

const { loginAdminInterceptor } = useCypressInterceptors();

describe("Dashboard", () => {
  beforeEach(() => {
    cy.viewport(1024, 600);
    cy.visit("/");
    cy.get("[data-cy='login-btn']").click();
    loginAdminInterceptor("myemail@gmail.com", "myAmazing@password");
    cy.wait("@login");
  });

  afterEach(() => {
    cy.logout();
  });

  it("display the number of content when there is no content", () => {
    cy.intercept(
      {
        method: "GET",
        https: true,
        url: "**/rest/v1/contents?select=content_id",
      },
      {
        headers: {
          "Content-Range": "*/0",
        },
        statusCode: 200,
        body: [],
      },
    ).as("totalContent");

    cy.wait("@totalContent");
    cy.get("[data-cy='total-content'] [data-cy='dashboard-card-value']").should(
      "have.text",
      "0",
    );

    cy.get(
      "[data-cy='total-content'] [data-cy='dashboard-card-description']",
    ).should("have.text", "Total content");
  });

  it("display the number of content when there are many", () => {
    cy.intercept(
      {
        method: "GET",
        https: true,
        url: "**/rest/v1/contents?select=content_id",
      },
      {
        headers: {
          "Content-Range": "*/178",
        },
        statusCode: 200,
        body: [],
      },
    ).as("totalContent");

    cy.wait("@totalContent");
    cy.get("[data-cy='total-content'] [data-cy='dashboard-card-value']").should(
      "have.text",
      "178",
    );
    cy.get(
      "[data-cy='total-content'] [data-cy='dashboard-card-description']",
    ).should("have.text", "Total content");
  });
});
