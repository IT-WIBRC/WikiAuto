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

  const initAdminPart = () => {
    const Content = content();

    cy.goToLogin();
    stubGetProfile();
    loginAdminInterceptor("myemail@gmail.com", "myAmazing@password");

    Content.totalInterceptor(0);
    Content.totalValidatedInterceptor(0);
    totalBadgeInterceptor(0);

    cy.wait("@login");
    cy.wait("@getProfile");
    cy.wait("@totalContent");
    cy.wait("@totalValidatedContent");
    cy.wait("@totalBadges");
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
      "**/rest/v1/contents?select=content_id%2Cstatus%2Ctitle%2Cuser_email%2Cupdated_at%2Cimage%2Ccreated_at%2Cexplanation%2Cbadges%28name%2Cbadge_id%2Cdescription%29";

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

    const getContentImageInterceptor = (path: string): void => {
      cy.intercept(`**/storage/v1/object/public/wikiAuto_images/${path}`, {
        fixture: "contentImage.png",
      }).as(`image-${path}`);
    };

    return {
      totalInterceptor,
      totalValidatedInterceptor,
      getListSuccessfullyInterceptor,
      GET_LIST_URL,
      getContentImageInterceptor,
    };
  };

  const getBadgeList = (asOptions = true): void => {
    const badgeUrl = asOptions ? "select=badge_id%2Cname" : "select=*";
    cy.intercept(
      {
        method: "GET",
        https: true,
        url: `**/rest/v1/badges?${badgeUrl}`,
      },
      (request) => {
        request.reply({
          statusCode: 200,
          fixture: "/badges.json",
        });
      },
    ).as("badge-list");
  };

  const totalBadgeInterceptor = (value: number, status: number = 200): void => {
    cy.intercept(
      {
        method: "GET",
        https: true,
        url: "**/rest/v1/badges?select=badge_id",
      },
      {
        headers: {
          "Content-Range": `*/${value}`,
        },
        statusCode: status,
        body: [],
      },
    ).as("totalBadges");
  };

  const badgeEditionInterceptor = ({
    id,
    alias,
    statusCode,
  }: {
    id: string;
    alias: string;
    statusCode: 201 | 403;
  }): void => {
    cy.intercept(
      {
        method: "PATCH",
        https: true,
        url: `**/rest/v1/badges?badge_id=eq.${id}`,
      },
      {
        statusCode,
        body: [],
      },
    ).as(alias);
  };

  //profile
  const PROFILE_URL = {
    GET: "**/rest/v1/profile?select=email%2Cusername%2Clastname%2Cfirstname%2Ccreated_at&user_id=eq.b4ebcf93-7b09-4ee1-bbb3-0a67c1cb1748",
    PATCH:
      "**/rest/v1/profile?user_id=eq.b4ebcf93-7b09-4ee1-bbb3-0a67c1cb1748&select=*",
  };

  const stubGetProfile = () => {
    cy.intercept(
      {
        method: "GET",
        url: PROFILE_URL.GET,
        https: true,
      },
      (request) => {
        request.reply({
          statusCode: 200,
          fixture: "/users/profile.json",
        });
      },
    ).as("getProfile");
  };

  return {
    loginAdminInterceptor,
    logoutAdminInterceptor,
    content,
    getBadgeList,
    totalBadgeInterceptor,
    initAdminPart,
    badgeEditionInterceptor,
    PROFILE_URL,
    stubGetProfile,
  };
}
