import useCypressInterceptors from "../utils/interceptors";

const {
  loginAdminInterceptor,
  logoutAdminInterceptor,
  totalContentInterceptor,
} = useCypressInterceptors();

describe("User Logout", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.get("[data-cy='login-btn']").click();
  });

  it("Logout successfully", () => {
    cy.get("[data-cy='login-title']").should("have.text", "Welcome back!");

    totalContentInterceptor(10);
    loginAdminInterceptor("mylogoutemail@gmail.com", "myAmazing@password");

    cy.wait("@login");

    cy.get("[data-cy='dashboard-title']").should("contain.text", "Dashboard");
    cy.wait("@totalContent");
    logoutAdminInterceptor();

    cy.get("[data-cy='login-title']").should("have.text", "Welcome back!");
  });
});
