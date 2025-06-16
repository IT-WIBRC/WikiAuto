import useCypressInterceptors from "../utils/interceptors";
import useCypressAssertions from "../utils/assertions";

const {
  loginAdminInterceptor,
  content,
  totalBadgeInterceptor,
  PROFILE_URL,
  stubGetProfile,
} = useCypressInterceptors();
const { assertDashboardCardContentHas, assertToastMessageIs } =
  useCypressAssertions();

describe("Dashboard", () => {
  const Content = content();

  describe("Dashboard Cards", () => {
    beforeEach(() => {
      cy.goToLogin();
      stubGetProfile();

      loginAdminInterceptor("myemail@gmail.com", "myAmazing@password");
      cy.wait("@login");
      cy.wait("@getProfile");
    });

    afterEach(() => {
      cy.logout();
    });

    it("shows all dashboard cards as empty when there is no data", () => {
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

    it("shows the correct numbers in dashboard cards when there is data", () => {
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

  describe("User Profile", () => {
    after(() => {
      cy.logout();
    });

    it("shows an error toast if fetching the user profile fails", () => {
      cy.goToLogin();
      loginAdminInterceptor("myemail@gmail.com", "myAmazing@password");
      cy.wait("@login");
      cy.intercept("GET", PROFILE_URL.GET, {
        statusCode: 500,
        body: {
          code: "unknown_error",
          message: "server error",
        },
      }).as("getProfileError");

      cy.wait("@getProfileError");

      assertToastMessageIs(
        "Sorry we encountered a server problem, try again later!",
      );
    });
  });
});
