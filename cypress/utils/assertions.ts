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

  const assertTableHeadersAre = (headers: string[]): void => {
    cy.get("[data-cy='header']").should("have.length", headers.length);
    headers.forEach((header, index) => {
      cy.get("[data-cy='header']").eq(index).should("have.text", header);
    });
  };

  const assertTableRowHas = (row: {
    id: string;
    title: string;
    email: string;
    status: string;
    badges: string[];
  }): void => {
    cy.get(`[data-cy-id='${row.id}']`).within(() => {
      cy.get("td").eq(0).should("have.text", row.title);
      cy.get("td").eq(1).should("have.text", row.email);
      cy.get("td")
        .eq(2)
        .within(() => {
          row.badges.forEach((badge) => {
            cy.get(`[data-cy='${badge}']`).should("have.text", badge);
          });
        });
      cy.get("td").eq(3).should("have.text", row.status);
    });
  };

  return {
    assertDashboardCardContentHas,
    assertTableHeadersAre,
    assertTableRowHas,
  };
}
