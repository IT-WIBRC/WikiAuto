import useCypressInterceptors from "../utils/interceptors";

const { loginAdminInterceptor } = useCypressInterceptors();

describe("Login page", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.get("[data-cy='login-btn']").click();
  });

  it("Login successfully", () => {
    cy.get("[data-cy='login-title']").should("have.text", "Welcome back!");
    cy.get("[data-cy='login-description']").should(
      "have.text",
      "Enter your Credentials to access your account",
    );

    loginAdminInterceptor("myemail@gmail.com", "myAmazing@password");

    cy.wait("@login").should(({ request }) => {
      expect(request.body.password).to.equals("myAmazing@password");
      expect(request.body.email).to.equals("myemail@gmail.com");
    });

    cy.get("[data-cy='dashboard-title']").should("contain.text", "Dashboard");

    cy.logout();
  });

  describe("Falling cases", () => {
    it("Display an error message when the credentials are wrong", () => {
      cy.get("[data-cy='login-title']").should("have.text", "Welcome back!");

      cy.intercept(
        {
          method: "POST",
          https: true,
          url: "**/auth/v1/token?grant_type=password",
        },
        {
          statusCode: 400,
          body: {
            error_code: "invalid_credentials",
            message: "Invalid login credentials",
          },
        },
      ).as("loginWithInvalidCredentials");

      cy.login("myWrongemail@gmail.com", "myAmazingWrong@password");

      cy.wait("@loginWithInvalidCredentials").should(({ request }) => {
        expect(request.body.password).to.equals("myAmazingWrong@password");
        expect(request.body.email).to.equals("myWrongemail@gmail.com");
      });

      cy.get("[data-cy='login-error-message']").should(
        "have.text",
        "Incorrect email or password",
      );
    });

    it("Display an error message when we have a server error", () => {
      cy.get("[data-cy='login-title']").should("have.text", "Welcome back!");

      cy.intercept(
        {
          method: "POST",
          https: true,
          url: "**/auth/v1/token?grant_type=password",
        },
        {
          statusCode: 500,
          body: {
            error_code: "InternalError",
            message: "An internal server error occurred",
          },
        },
      ).as("loginWithInvalidCredentials");

      cy.login("myErroremail@gmail.com", "myAmazingWrong@password");

      cy.wait("@loginWithInvalidCredentials").should(({ request }) => {
        expect(request.body.password).to.equals("myAmazingWrong@password");
        expect(request.body.email).to.equals("myErroremail@gmail.com");
      });

      cy.get("[data-cy='login-error-message']").should(
        "have.text",
        "An enforcing error has occurred, please try again or report it",
      );
    });
  });
});
