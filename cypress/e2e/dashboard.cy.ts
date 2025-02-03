import useCypressInterceptors from "../utils/interceptors";
import useCypressAssertions from "../utils/assertions";

const { loginAdminInterceptor, content, totalBadgeInterceptor } =
  useCypressInterceptors();

const { assertDashboardCardContentHas } = useCypressAssertions();

describe("Dashboard", () => {
  const Content = content();

  beforeEach(() => {
    cy.goToLogin();
    loginAdminInterceptor("myemail@gmail.com", "myAmazing@password");
    cy.wait("@login");
  });

  afterEach(() => {
    cy.logout();
  });

  it("display the total cards when there are empty", () => {
    Content.totalInterceptor(0);
    Content.totalValidatedInterceptor(0);
    totalBadgeInterceptor(0);

    cy.wait("@totalContent");
    cy.wait("@totalValidatedContent");
    cy.wait("@totalBadges");

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

    assertDashboardCardContentHas({
      selector: "total-badge",
      value: 0,
      description: "Total badges",
    });
  });

  it("display the total cards when there are many", () => {
    Content.totalInterceptor(178);
    Content.totalValidatedInterceptor(150);
    totalBadgeInterceptor(600);

    cy.wait("@totalContent");
    cy.wait("@totalValidatedContent");
    cy.wait("@totalBadges");

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

    assertDashboardCardContentHas({
      selector: "total-badge",
      value: 600,
      description: "Total badges",
    });
  });
});
