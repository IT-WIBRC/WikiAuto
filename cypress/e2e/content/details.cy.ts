import useCypressInterceptors from "../../utils/interceptors";
import useCypressAssertions from "../../utils/assertions";

const { loginAdminInterceptor, content } = useCypressInterceptors();
const { assertContentDetailsAre } = useCypressAssertions();

const Content = content();
describe("Display content details", () => {
  beforeEach(() => {
    cy.goToLogin();
    loginAdminInterceptor("myemail@gmail.com", "myAmazing@password");
    cy.wait("@login");
  });

  afterEach(() => {
    cy.logout();
  });

  it("should display the content details successfully", () => {
    Content.getListSuccessfullyInterceptor();

    cy.goToMenu("content");
    cy.wait("@content-list");

    cy.get("[data-cy='no-content']").should("not.exist");
    cy.get("[data-cy='table-row']").should("have.length", 2);

    content().getContentImageInterceptor("0.021345.png");

    cy.clock(new Date(2025, 1, 13, 19, 1, 20));

    cy.get("[data-cy-id='row-a3cacd2b-7ee3-4c84-a6bf-52742de57ab0']").within(
      () => {
        cy.get("[data-cy='open-details-icon']").click();
      },
    );

    cy.wait("@image-0.021345.png");

    assertContentDetailsAre({
      title: "Avoid driving while tired",
      badges: ["badge 10", "badge 11", "badge 12"],
      email: "email2@email.com",
      status: "PENDING",
      updatedDate: "2024/11/18 14:25:08",
      createdDate: "2024/12/18 11:25:08",
      explanation:
        "<div>Wear Your Seat Belt. Worn properly, a seat belt prevents you from being tossed around inside of a crashing vehicle or, at worst, flung out through the</div>",
      image: "public/wikiAuto_images/0.021345.png",
      id: "a3cacd2b-7ee3-4c84-a6bf-52742de57ab0",
    });

    cy.clock().invoke("restore");
  });
});
