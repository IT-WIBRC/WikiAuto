import useCypressInterceptors from "../../utils/interceptors";
import useCypressAssertions from "../../utils/assertions";

const { loginAdminInterceptor, content, getBadgeList } =
  useCypressInterceptors();

const { assertToastMessageIs } = useCypressAssertions();

describe("Create content", () => {
  const Content = content();

  beforeEach(() => {
    cy.goToLogin();
    loginAdminInterceptor("myemail@gmail.com", "myAmazing@password");
    cy.wait("@login");
    Content.getListSuccessfullyInterceptor();
    cy.goToMenu("content");
    cy.wait("@content-list");

    cy.get("[data-cy='no-content']").should("not.exist");
    cy.get("[data-cy='table-row']").should("have.length", 2);

    cy.get("[data-cy='go-to-content-create']").should(
      "have.text",
      "Add a content",
    );
    cy.get("[data-cy='go-to-content-create']").click();

    fillContentForm();
  });

  it("should be created successfully", () => {
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
    ).as("create-image");

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
    ).as("create-content");

    cy.intercept(
      {
        method: "POST",
        https: true,
        url: "**/rest/v1/content_badges?columns=%22badge_id%22%2C%22content_id%22",
      },
      {
        statusCode: 201,
      },
    ).as("bind-badges-to-content");

    cy.get("form").submit();
    cy.wait("@create-image");

    cy.wait("@create-content").should(({ request }) => {
      expect(request.body.title).to.equals("My test title");
      expect(request.body.explanation).to.equals(
        "<p>my amazing explanation about this subject</p>",
      );
      expect(request.body.status).to.equals("VALIDATED");
      expect(request.body.image).to.match(/^0\.(\d+)\.[a-z]{3,4}$/);
    });

    cy.wait("@bind-badges-to-content").should(({ request }) => {
      expect(request.body.length).to.equal(2);

      expect(request.body[0]).to.deep.equal({
        badge_id: "ae702114-f526-4cbd-a45a-985f49427ba2",
        content_id: "37425176-f095-4a1c-9dad-015d3224e70b",
      });

      expect(request.body[1]).to.deep.equal({
        badge_id: "c87b0e34-bba7-4b69-ae54-47121b0c09df",
        content_id: "37425176-f095-4a1c-9dad-015d3224e70b",
      });
    });

    assertToastMessageIs("Content created successfully 🥳");

    cy.wait("@content-list");
    cy.logout();
  });

  describe("Error cases", () => {
    it("should display an error when the image failed to be upload", () => {
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

    it("should display an error when the content failed to be created", () => {
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
      ).as("create-image");

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
      ).as("create-content-failure");

      cy.get("form").submit();
      cy.wait("@create-image");
      cy.wait("@create-content-failure").should(({ _, response }) => {
        expect(response.body.code).to.equal("4005");
      });

      assertToastMessageIs(
        "Looks like the operation has failed 🥲, please try again",
      );
    });

    it("should display an error when the content badges failed to be created", () => {
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
      ).as("create-image");

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
      ).as("create-content");

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
      cy.wait("@create-image");
      cy.wait("@create-content");

      cy.wait("@bind-badges-to-content-failure").should(({ _, response }) => {
        expect(response.body.code).to.equal("40905");
      });

      assertToastMessageIs(
        "Looks like the operation has failed 🥲, please try again",
      );
    });
  });

  const fillContentForm = (): void => {
    cy.get("[data-cy='illustration-input'] input[type=file]").selectFile(
      "cypress/fixtures/contentImage.png",
      { force: true },
    );

    cy.get("[data-cy='title-input'] input").type("My test title");

    getBadgeList();
    cy.get("[data-cy='select-badge-input'] input").focus();
    cy.wait("@badge-list");
    cy.get(
      "[data-test-id='option-ae702114-f526-4cbd-a45a-985f49427ba2']",
    ).click();
    cy.get(
      "[data-test-id='option-c87b0e34-bba7-4b69-ae54-47121b0c09df']",
    ).click();
    cy.get("[data-cy='title-input']").click({ force: true });

    cy.get("[data-cy='title-input']").click({ waitForAnimations: true });
    cy.wait(700);

    cy.get("[data-cy='content-creation']").scrollTo(0, 600, {
      easing: "linear",
    });

    cy.get("[data-cy='explanation-input'] div[contenteditable=true]").type(
      "my amazing explanation about this subject",
    );
  };
});
