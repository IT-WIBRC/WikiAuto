import useCypressInterceptors from "../utils/interceptors";

const { loginAdminInterceptor, logoutAdminInterceptor, content } =
  useCypressInterceptors();

describe("User Logout", () => {
  beforeEach(() => {
    cy.goToLogin();
  });

  it("Logout successfully", () => {
    cy.get("[data-cy='login-title']").should("have.text", "Welcome back!");

    content().totalInterceptor(10);
    content().totalValidatedInterceptor(10);
    loginAdminInterceptor("mylogoutemail@gmail.com", "myAmazing@password");

    cy.wait("@login");

    cy.get("[data-cy='dashboard-title']").should("contain.text", "Dashboard");
    cy.wait("@totalContent");
    cy.wait("@totalValidatedContent");
    logoutAdminInterceptor();

    cy.get("[data-cy='login-title']").should("have.text", "Welcome back!");
  });
});
