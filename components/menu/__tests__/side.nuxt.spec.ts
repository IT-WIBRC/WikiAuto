import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { VueWrapper } from "@vue/test-utils";
import { mountSuspended, mockNuxtImport } from "@nuxt/test-utils/runtime";
import {
  BaseImage,
  IconExpandRightDouble,
  IconLogOut,
  MenuItem,
  MenuSide,
} from "#components";
import { createTestingPinia } from "@pinia/testing";
import { useAuthStore } from "~/stores/auth.store";

describe("MenuSide", () => {
  mockNuxtImport("useI18n", () => {
    return () => ({
      t: vi.fn((msg: string) => msg),
    });
  });

  const { mockNavigateTo } = vi.hoisted(() => {
    return { mockNavigateTo: vi.fn() };
  });

  mockNuxtImport("navigateTo", () => {
    return mockNavigateTo;
  });

  const { mockedUseRouteHoisted } = vi.hoisted(() => {
    return {
      mockedUseRouteHoisted: vi.fn(() => {
        return {
          path: "",
        };
      }),
    };
  });

  mockNuxtImport("useRoute", () => {
    return mockedUseRouteHoisted;
  });

  let menuSide: VueWrapper;
  beforeAll(async () => {
    menuSide = await mountSuspended(MenuSide);
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  it("should render correctly", () => {
    expect(menuSide.exists()).toBe(true);
  });

  it("should render the logo", () => {
    const logo = menuSide.findComponent(BaseImage);
    expect(logo.exists()).toBe(true);
    expect(logo.props()).toEqual({
      name: "wikiAuto.png",
      alt: "The image provided is not right",
      fetchPriority: "high",
      loading: "eager",
    });
  });

  it("should render the expand icon button", () => {
    const toggleExpandButton = menuSide.find("[data-cy='toggle-expand-btn']");
    expect(toggleExpandButton.exists()).toBe(true);
    const expandIcon = toggleExpandButton.findComponent(IconExpandRightDouble);
    expect(expandIcon.exists()).toBe(true);
    expect(expandIcon.attributes().class).toContain("stroke-gray-900 h-4 w-4");
    expect(toggleExpandButton.element.title).toContain("expand");
  });

  it("should render the logout icon button", () => {
    const logOutButton = menuSide.find("[data-cy='logout-btn']");
    expect(logOutButton.exists()).toBe(true);
    const logOutIcon = logOutButton.findComponent(IconLogOut);
    expect(logOutIcon.exists()).toBe(true);
    expect(logOutIcon.attributes().class).toContain("h-4 w-4");
    expect(logOutButton.element.title).toContain("logout");
  });

  it("should have the awaited style on the  logout button icon when expanded", async () => {
    expect(
      menuSide.find("[data-cy='logout-btn']").attributes().class,
    ).not.toContain("gap-x-2");

    const menuSideCustom = await mountSuspended(MenuSide);

    await menuSide.find("[data-cy='toggle-expand-btn']").trigger("click");

    expect(
      menuSideCustom.find("[data-cy='logout-btn']").attributes().class,
    ).not.toContain("gap-x-2");
  });

  it("should have the awaited style when the menu is expanded", async () => {
    menuSide = await mountSuspended(MenuSide);
    expect(menuSide.find("nav").attributes().class).toContain("ml-4 my-4");
    expect(menuSide.findComponent(BaseImage).attributes().class).toContain(
      "h-12 w-12",
    );
    expect(
      menuSide.find("[data-cy='toggle-expand-btn']").attributes().class,
    ).not.toContain("gap-x-2");
    expect(
      menuSide.findComponent(IconExpandRightDouble).attributes().class,
    ).toContain("h-4 w-4");

    let toggleExpandButton = menuSide.find("[data-cy='toggle-expand-btn']");
    expect(toggleExpandButton.attributes().title).toBe("expand");

    await toggleExpandButton.trigger("click");
    toggleExpandButton = menuSide.find("[data-cy='toggle-expand-btn']");
    expect(toggleExpandButton.attributes().class).toContain("gap-x-2");

    expect(menuSide.find("nav").attributes().class).not.toContain("ml-4 my-4");
    expect(toggleExpandButton.attributes().title).toBe("");
    expect(toggleExpandButton.text()).toBe("abate");
    expect(menuSide.findComponent(BaseImage).attributes().class).toContain(
      "h-[5.3rem]",
    );
    expect(
      toggleExpandButton.findComponent(IconExpandRightDouble).attributes()
        .class,
    ).toContain("translate rotate-180 h-5 w-5");
  });

  it("should navigate to `/auth` when we click on the logout button", async () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: true,
    });
    const authStore = useAuthStore(pinia);
    authStore.logout = vi.fn().mockReturnValueOnce({
      status: "success",
    });
    const menuSideCustom = await mountSuspended(MenuSide);
    const logOutButton = menuSideCustom.find("[data-cy='logout-btn']");
    expect(logOutButton.exists()).toBe(true);
    await logOutButton.trigger("click");
    expect(mockNavigateTo).toHaveBeenCalledTimes(1);
    expect(mockNavigateTo).toHaveBeenCalledWith("/auth");
  });

  it("should toast an error when the logout failed", async () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: true,
    });
    const authStore = useAuthStore(pinia);
    authStore.logout = vi.fn().mockReturnValueOnce({
      status: "error",
    });
    useToast.error = vi.fn();
    const menuSideCustom = await mountSuspended(MenuSide);
    const logOutButton = menuSideCustom.find("[data-cy='logout-btn']");
    expect(logOutButton.exists()).toBe(true);
    await logOutButton.trigger("click");
    expect(useToast.error).toHaveBeenCalledTimes(1);
    expect(useToast.error).toHaveBeenCalledWith("failed_logout");
  });

  describe("Menu items", () => {
    const menus = [
      {
        title: "dashboard",
        icon: "DASHBOARD",
        path: "/dashboard",
      },
      {
        title: "content",
        icon: "CONTENT",
        path: "/content",
      },
    ];

    it("should render the menu items", async () => {
      menuSide = await mountSuspended(MenuSide);
      const menuItems = menuSide.findAllComponents(MenuItem);
      expect(menuItems.length).toBe(2);
      menuItems.forEach((menuItem, index) => {
        expect(menuItem.props()).toEqual({
          title: menus[index].title,
          icon: menus[index].icon,
          path: menus[index].path,
          isOpened: false,
          isSelected: false,
        });
      });
    });

    it("should render the items menus properly when the menu is expanded", async () => {
      const menuSideCustom = await mountSuspended(MenuSide);

      await menuSideCustom
        .find("[data-cy='toggle-expand-btn']")
        .trigger("click");
      const menuItems = menuSideCustom.findAllComponents(MenuItem);
      expect(menuItems.length).toBe(2);
      menuItems.forEach((menuItem, index) => {
        expect(menuItem.props()).toEqual({
          title: menus[index].title,
          icon: menus[index].icon,
          path: menus[index].path,
          isOpened: true,
          isSelected: false,
        });
      });
    });

    it("should render the menu `/dashboard` with awaited props `isSelected` as true when we are on the designated menu", async () => {
      mockedUseRouteHoisted.mockRestore();
      const currentRoutePath = "/dashboard";
      mockedUseRouteHoisted.mockImplementation(() => {
        return {
          path: "/dashboard",
        };
      });

      const menuSideCustomForDashboard = await mountSuspended(MenuSide);
      const menuItems = menuSideCustomForDashboard.findAllComponents(MenuItem);
      expect(menuItems.length).toBe(2);
      menuItems.forEach((menuItem, index) => {
        expect(menuItem.props()).toEqual({
          title: menus[index].title,
          icon: menus[index].icon,
          path: menus[index].path,
          isOpened: false,
          isSelected: menus[index].path === currentRoutePath,
        });
      });
      mockedUseRouteHoisted.mockRestore();
    });

    it("should render the menu `/content` with awaited props `isSelected` as true when we are on the designated menu", async () => {
      mockedUseRouteHoisted.mockRestore();
      const currentRoutePath = "/content";
      mockedUseRouteHoisted.mockImplementation(() => {
        return {
          path: "/content",
        };
      });

      const menuSideCustomForContent = await mountSuspended(MenuSide);
      const menuItems = menuSideCustomForContent.findAllComponents(MenuItem);
      expect(menuItems.length).toBe(2);
      menuItems.forEach((menuItem, index) => {
        expect(menuItem.props()).toEqual({
          title: menus[index].title,
          icon: menus[index].icon,
          path: menus[index].path,
          isOpened: false,
          isSelected: menus[index].path === currentRoutePath,
        });
      });
      mockedUseRouteHoisted.mockReset();
    });
  });
});
