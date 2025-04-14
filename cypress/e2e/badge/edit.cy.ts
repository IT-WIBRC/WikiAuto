import useCypressInterceptors from "../../utils/interceptors";
import useCypressAssertions from "../../utils/assertions";

const { getBadgeList, initAdminPart, badgeEditionInterceptor } =
  useCypressInterceptors();
const { assertToastMessageIs } = useCypressAssertions();

const badgeId = "ae702114-f526-4cbd-a45a-985f49427ba2";

describe("Edit badge", () => {
  beforeEach(() => {
    initAdminPart();
  });

  it("should edit the tag successfully", () => {
    const isForSuccessCase = true;
    startEdition(badgeId, isForSuccessCase);

    fillBadgeForm(" My test title", " My test description");

    cy.wait("@edit-badge").should(({ request }) => {
      expect(request.body.name).to.equals("badge 2 My test title");
      expect(request.body.description).to.equals(
        "My description 2 My test description",
      );
    });

    assertToastMessageIs("Edited successfully");

    cy.wait("@badge-list");

    cy.logout();
  });

  it("should display an error message as toast when the edition failed", () => {
    startEdition(badgeId);

    cy.get("[data-cy='field-title-input'] input").clear();
    cy.get("[data-cy='field-description-input'] input").clear();

    fillBadgeForm("My test title 2", "My test description 2");

    cy.wait("@failed-edition-badge").should(({ request }) => {
      expect(request.body.name).to.equals("My test title 2");
      expect(request.body.description).to.equals("My test description 2");
    });

    assertToastMessageIs("Failed to edit");
  });

  const startEdition = (badgeId: string, isForSuccess: boolean): void => {
    const asOptions = false;
    getBadgeList(asOptions);

    cy.goToMenu("badges");
    cy.wait("@badge-list");

    cy.get("[data-cy='empty-badge-list']").should("not.exist");
    cy.get("[data-cy='badge']").should("have.length", 4);

    cy.get(`[data-cy-id='badge-${badgeId}'] [data-cy='edit-btn']`).click();

    if (isForSuccess) {
      badgeEditionInterceptor({
        statusCode: 201,
        alias: "edit-badge",
        id: badgeId,
      });

      getBadgeList(asOptions);
      return;
    }
    badgeEditionInterceptor({
      statusCode: 403,
      alias: "failed-edition-badge",
      id: badgeId,
    });

    getBadgeList(asOptions);
  };

  const fillBadgeForm = (name: string, description: string): void => {
    cy.get("[data-cy='field-title-input'] input").type(name);
    cy.get("[data-cy='field-description-input'] input").type(description);

    cy.get("[data-cy='edit-badge-btn']").click();
  };
});
