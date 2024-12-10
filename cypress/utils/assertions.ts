/// <reference types="cypress" />
export default function useCypressAssertions() {
  const assertDashboardCardContentHas = ({
    selector,
    value,
    description,
  }: {
    selector: string;
    value: number;
    description: string;
  }): void => {
    cy.get(`[data-cy='${selector}']`).within(() => {
      cy.get("[data-cy='dashboard-card-value']").should(
        "have.text",
        `${value}`,
      );

      cy.get("[data-cy='dashboard-card-description']").should(
        "have.text",
        description,
      );
    });
  };

  return {
    assertDashboardCardContentHas,
  };
}
