import useCypressInterceptors from "../utils/interceptors";
import useCypressAssertions from "../utils/assertions";

const {
  loginAdminInterceptor,
  totalContentInterceptor,
  totalValidatedContentInterceptor,
} = useCypressInterceptors();

const { assertDashboardCardContentHas } = useCypressAssertions();

describe("Dashboard", () => {
  beforeEach(() => {
    cy.goToLogin();
    loginAdminInterceptor("myemail@gmail.com", "myAmazing@password");
    cy.wait("@login");
  });

  afterEach(() => {
    cy.logout();
  });

  it("display the total cards when there are empty", () => {
    totalContentInterceptor(0);
    totalValidatedContentInterceptor(0);

    cy.wait("@totalContent");
    cy.wait("@totalValidatedContent");

    assertDashboardCardContentHas({
      selector: "total-content",
      value: 0,
      description: "Total content",
    });

    assertDashboardCardContentHas({
      selector: "total-validated-content",
      value: 0,
      description: "Total validated content",
    });
  });

  it("display the total cards when there are many", () => {
    totalContentInterceptor(178);
    totalValidatedContentInterceptor(150);

    cy.wait("@totalContent");
    cy.wait("@totalValidatedContent");

    assertDashboardCardContentHas({
      selector: "total-content",
      value: 178,
      description: "Total content",
    });

    assertDashboardCardContentHas({
      selector: "total-validated-content",
      value: 150,
      description: "Total validated content",
    });
  });
});
