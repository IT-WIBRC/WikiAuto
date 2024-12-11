/// <reference types="cypress" />
export default function useCypressInterceptors() {
  const loginAdminInterceptor = (email: string, password: string): void => {
    cy.intercept(
      {
        method: "POST",
        https: true,
        url: "**/auth/v1/token?grant_type=password",
      },
      (request) => {
        request.reply({
          statusCode: 200,
          fixture: "/users/user.json",
        });
      },
    ).as("login");

    cy.login(email, password);
  };

  const logoutAdminInterceptor = (): void => {
    cy.intercept(
      {
        method: "POST",
        https: true,
        url: "**/auth/v1/logout?scope=global",
      },
      {
        statusCode: 204,
      },
    ).as("logout");

    cy.logout();
  };

  const totalContentInterceptor = (
    value: number,
    status: number = 200,
  ): void => {
    cy.intercept(
      {
        method: "GET",
        https: true,
        url: "**/rest/v1/contents?select=content_id",
      },
      {
        headers: {
          "Content-Range": `*/${value}`,
        },
        statusCode: status,
        body: [],
      },
    ).as("totalValidatedContent");
  };

  const totalValidatedContentInterceptor = (
    value: number,
    status: number = 200,
  ): void => {
    cy.intercept(
      {
        method: "GET",
        https: true,
        url: "**/rest/v1/contents?select=content_id%2Cstatus&status=eq.VALIDATED",
      },
      {
        headers: {
          "Content-Range": `*/${value}`,
        },
        statusCode: status,
        body: [],
      },
    ).as("totalContent");
  };

  return {
    loginAdminInterceptor,
    logoutAdminInterceptor,
    totalContentInterceptor,
    totalValidatedContentInterceptor,
  };
}
