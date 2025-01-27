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

  const content = () => {
    const GET_LIST_URL =
      "**/rest/v1/contents?select=content_id%2Cstatus%2Ctitle%2Cuser_email%2Cupdated_at%2Cbadges%28name%29";

    const totalInterceptor = (value: number, status: number = 200): void => {
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

    const totalValidatedInterceptor = (
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

    const getListSuccessfullyInterceptor = (alias = "content-list") => {
      cy.intercept(
        {
          method: "GET",
          https: true,
          url: GET_LIST_URL,
        },
        (request) => {
          request.reply({
            statusCode: 200,
            fixture: "/contents/list.json",
          });
        },
      ).as(alias);
    };

    return {
      totalInterceptor,
      totalValidatedInterceptor,
      getListSuccessfullyInterceptor,
      GET_LIST_URL,
    };
  };

  const getBadgeList = (): void => {
    cy.intercept(
      {
        method: "GET",
        https: true,
        url: "**/rest/v1/badges?select=badge_id%2Cname",
      },
      (request) => {
        request.reply({
          statusCode: 200,
          fixture: "/badges.json",
        });
      },
    ).as("badge-list");
  };

  return {
    loginAdminInterceptor,
    logoutAdminInterceptor,
    content,
    getBadgeList,
  };
}
