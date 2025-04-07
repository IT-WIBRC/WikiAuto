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

  const assertTableHeadersAre = (
    headers: string[],
    headersLength: number,
  ): void => {
    cy.get("[data-cy='header']").should("have.length", headersLength);
    const startIndex = headersLength - headers.length;
    headers.forEach((header, index) => {
      cy.get("[data-cy='header']")
        .eq(startIndex + index)
        .should("have.text", header);
    });
  };

  const assertTableRowHas = (row: {
    id: string;
    title: string;
    email: string;
    status: string;
    badges: string[];
    remaining?: string;
  }): void => {
    cy.get(`[data-cy-id='row-${row.id}']`).within(() => {
      cy.get("td").eq(1).should("have.text", row.title);
      cy.get("td").eq(2).should("have.text", row.email);
      cy.get("td")
        .eq(3)
        .within(() => {
          if (row.remaining) {
            cy.get("[data-cy='remainingBadges']").should(
              "include.text",
              row.remaining,
            );
          }
          row.badges.forEach((badge) => {
            cy.get(`[data-cy='${badge}']`).should("have.text", badge);
          });
        });
      cy.get("td").eq(4).should("have.text", row.status);
    });
  };

  const assertToastMessageIs = (message: string): void => {
    cy.clock();
    cy.tick(5000);

    cy.get("[data-test='message']")
      .should("be.visible")
      .should("have.text", message);

    cy.tick(15000);
    cy.clock().invoke("restore");
  };

  const assertContentDetailsAre = (detail: {
    id: string;
    title: string;
    email: string;
    status: string;
    badges: string[];
    createdDate: string;
    image: string;
    updatedDate: string;
    explanation: string;
  }): void => {
    cy.get(`[data-cy='${detail.id}']`).within(() => {
      cy.get("[data-cy='status']").should("contain.text", detail.status);
      cy.get("[data-cy='created_by']").should("contain.text", detail.email);
      cy.get("[data-cy='created_at']").should(
        "contain.text",
        detail.createdDate,
      );
      cy.get("[data-cy='status']").should("contain.text", detail.status);
      cy.get("[data-cy='updated_at']").should(
        "contain.text",
        detail.updatedDate,
      );
      cy.get("[data-cy='title']").should("contain.html", detail.title);

      cy.get("[data-cy='badges']").within(() => {
        detail.badges.forEach((badge) => {
          cy.get(`[data-cy='${badge}']`).should("have.text", badge);
        });
      });

      cy.get("[data-cy='explanation']").should(
        "contain.html",
        detail.explanation,
      );

      cy.get("[data-cy='illustration']")
        .invoke("attr", "alt")
        .should("eq", detail.title);

      cy.get("[data-cy='illustration']")
        .invoke("attr", "src")
        .should("contain", detail.image);

      cy.get("[data-cy='illustration']")
        .invoke("attr", "src")
        .should("match", new RegExp("^https?://"));
    });
  };

  const assertBadgeDetailsIs = (
    id: string,
    title: string,
    description: string,
  ): void => {
    cy.get(`[data-cy-id='badge-${id}']`).within(() => {
      cy.get("[data-cy='title']").should("have.text", title);
      cy.get("[data-cy='description']").should("have.text", description);
    });
  };

  return {
    assertDashboardCardContentHas,
    assertTableHeadersAre,
    assertTableRowHas,
    assertToastMessageIs,
    assertContentDetailsAre,
    assertBadgeDetailsIs,
  };
}
