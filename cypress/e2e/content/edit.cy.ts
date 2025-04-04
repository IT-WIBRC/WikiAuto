import useCypressInterceptors from "../../utils/interceptors";
import useCypressAssertions from "../../utils/assertions";

const { loginAdminInterceptor, content, getBadgeList } =
  useCypressInterceptors();

const { assertToastMessageIs } = useCypressAssertions();

describe("Edit content", () => {
  const ContentInterceptor = content();

  beforeEach(() => {
    cy.goToLogin();
    loginAdminInterceptor("myemail@gmail.com", "myAmazing@password");
    cy.wait("@login");
    ContentInterceptor.getListSuccessfullyInterceptor();
    cy.goToMenu("content");
    cy.wait("@content-list");

    cy.get("[data-cy='no-content']").should("not.exist");
    cy.get("[data-cy='table-row']").should("have.length", 2);

    cy.get("[data-cy-id='row-a3cacd2b-7ee3-4c84-a6bf-52742de57ab0']").within(
      () => {
        cy.get("[data-cy='open-details-icon']").click();
      },
    );

    cy.get("[data-cy='a3cacd2b-7ee3-4c84-a6bf-52742de57ab0']").within(() => {
      getBadgeList();
      ContentInterceptor.getContentImageInterceptor("0.021345.png");
    });
  });

  describe("All", () => {
    beforeEach(() => {
      cy.openDetailDropdownActionsFor("edit");
      cy.wait("@badge-list");
      cy.wait("@image-0.021345.png");
    });

    it("should be edited successfully", () => {
      cy.intercept(
        {
          method: "POST",
          https: true,
          url: "**/storage/v1/object/wikiAuto_images/**",
        },
        {
          statusCode: 201,
          body: {
            Key: "wikiAuto_images/0.9907490510583932.png",
            Id: "37425176-f095-4a1c-9dad-015d3224e70b",
          },
        },
      ).as("update-image");

      cy.intercept(
        {
          method: "POST",
          https: true,
          url: "**/rest/v1/contents?select=content_id&limit=1",
        },
        {
          statusCode: 201,
          body: {
            content_id: "37425176-f095-4a1c-9dad-015d3224e70b",
          },
        },
      ).as("edit-content");

      cy.intercept(
        {
          method: "POST",
          https: true,
          url: "**/rest/v1/content_badges?columns=%22badge_id%22%2C%22content_id%22",
        },
        {
          statusCode: 201,
        },
      ).as("edit-bind-badges-to-content");

      cy.get("[data-cy-id='draft']").click();
      cy.get("[data-cy='title-input'] input").type(" mainly at night");
      cy.get("[data-cy='selected-badge'] [data-cy='remove']").eq(1).click();

      cy.get("[data-cy='explanation-input'] div[contenteditable=true]").type(
        " other thing more",
      );

      cy.get("[data-cy='content-edition']").scrollTo(0, 600, {
        easing: "linear",
      });

      cy.get("form").submit();
      cy.wait("@update-image");

      cy.wait("@edit-content").should(({ request }) => {
        expect(request.body.title).to.equals(
          "Avoid driving while tired mainly at night",
        );
        expect(request.body.explanation).to.equals(
          "<p>Wear Your Seat Belt. Worn properly, a seat belt prevents you from being tossed around inside of a crashing vehicle or, at worst, flung out through the other thing more</p>",
        );
        expect(request.body.status).to.equals("DRAFT");
        expect(request.body.image).to.match(/^0\.(\d+)\.[a-z]{3,4}$/);
      });

      cy.wait("@edit-bind-badges-to-content").should(({ request }) => {
        expect(request.body.length).to.equal(2);

        expect(request.body[0]).to.deep.equal({
          badge_id: "356121c5-099e-4918-a551-a7289642e130",
          content_id: "37425176-f095-4a1c-9dad-015d3224e70b",
        });

        expect(request.body[1]).to.deep.equal({
          badge_id: "656121c5-899e-4918-a551-a7289642e130",
          content_id: "37425176-f095-4a1c-9dad-015d3224e70b",
        });
      });

      assertToastMessageIs("Content edited successfully 🥳");

      cy.wait("@content-list");
      cy.logout();
    });

    describe("Error cases", () => {
      it("should display an error when the image has failed to be upload", () => {
        cy.intercept(
          {
            method: "POST",
            https: true,
            url: "**/storage/v1/object/wikiAuto_images/**",
          },
          {
            statusCode: 403,
            body: {
              code: "4035",
              message: "Failed to upload image",
            },
          },
        ).as("create-image-failed");

        cy.get("form").submit();
        cy.wait("@create-image-failed").should(({ _, response }) => {
          expect(response.body.code).to.equal("4035");
        });

        assertToastMessageIs(
          "Looks like the operation has failed 🥲, please try again",
        );
      });

      it("should display an error when the content failed to be edited", () => {
        cy.intercept(
          {
            method: "POST",
            https: true,
            url: "**/storage/v1/object/wikiAuto_images/**",
          },
          {
            statusCode: 201,
            body: {
              Key: "wikiAuto_images/0.9907490510583932.png",
              Id: "37425176-f095-4a1c-9dad-015d3224e70b",
            },
          },
        ).as("edit-or-created-image");

        cy.intercept(
          {
            method: "POST",
            https: true,
            url: "**/rest/v1/contents?select=content_id&limit=1",
          },
          {
            statusCode: 400,
            body: {
              code: "4005",
              message: "Failed to upload image",
            },
          },
        ).as("edit-content-failure");

        cy.get("form").submit();
        cy.wait("@edit-or-created-image");
        cy.wait("@edit-content-failure").should(({ _, response }) => {
          expect(response.body.code).to.equal("4005");
        });

        assertToastMessageIs(
          "Looks like the operation has failed 🥲, please try again",
        );
      });

      it("should display an error when the content badges failed to be edited", () => {
        cy.intercept(
          {
            method: "POST",
            https: true,
            url: "**/storage/v1/object/wikiAuto_images/**",
          },
          {
            statusCode: 201,
            body: {
              Key: "wikiAuto_images/0.9907490510583932.png",
              Id: "37425176-f095-4a1c-9dad-015d3224e70b",
            },
          },
        ).as("edit-image");

        cy.intercept(
          {
            method: "POST",
            https: true,
            url: "**/rest/v1/contents?select=content_id&limit=1",
          },
          {
            statusCode: 201,
            body: {
              content_id: "37425176-f095-4a1c-9dad-015d3224e70b",
            },
          },
        ).as("edit-content");

        cy.intercept(
          {
            method: "POST",
            https: true,
            url: "**/rest/v1/content_badges?columns=%22badge_id%22%2C%22content_id%22",
          },
          {
            statusCode: 409,
            body: {
              code: "40905",
              message: "Request failed",
            },
          },
        ).as("bind-badges-to-content-failure");

        cy.get("form").submit();
        cy.wait("@edit-image");
        cy.wait("@edit-content");

        cy.wait("@bind-badges-to-content-failure").should(({ _, response }) => {
          expect(response.body.code).to.equal("40905");
        });

        assertToastMessageIs(
          "Looks like the operation has failed 🥲, please try again",
        );
      });
    });
  });

  describe("Edit Status", () => {
    beforeEach(() => {
      cy.get("[data-cy='a3cacd2b-7ee3-4c84-a6bf-52742de57ab0']").within(() => {
        cy.openDetailDropdownActionsFor("update-status");
      });
    });

    it("should be edited successfully", () => {
      cy.intercept(
        {
          method: "PATCH",
          https: true,
          url: "**/rest/v1/contents?content_id=eq.a3cacd2b-7ee3-4c84-a6bf-52742de57ab0",
        },
        {
          statusCode: 201,
        },
      ).as("edit-content-status");

      cy.get("[data-cy-id='draft']").click();

      cy.get("[data-cy='update-btn']").click();

      cy.wait("@edit-content-status").should(({ request }) => {
        expect(request.body.status).to.equals("DRAFT");
      });

      assertToastMessageIs("Status updated with success 🥳");

      cy.wait("@content-list");
      cy.logout();
    });

    it.skip("should display an error when the content status failed to be edited", () => {
      cy.intercept(
        {
          method: "PATCH",
          https: true,
          url: "**/rest/v1/contents?content_id=eq.a3cacd2b-7ee3-4c84-a6bf-52742de57ab0",
        },
        {
          statusCode: 404,
        },
      ).as("edit-content-status");

      cy.get("[data-cy-id='draft']").click();

      cy.get("[data-cy='update-btn']").click();

      cy.wait("@edit-content-status").should(({ _, response }) => {
        expect(response.body.code).to.equal("4005");
      });

      assertToastMessageIs("Failed to update");
    });
  });
});
