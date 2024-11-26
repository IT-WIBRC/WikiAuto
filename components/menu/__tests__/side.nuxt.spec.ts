import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { VueWrapper } from "@vue/test-utils";
import { mountSuspended, mockNuxtImport } from "@nuxt/test-utils/runtime";
import {
  BaseImage,
  IconExpandRightDouble,
  MenuItem,
  MenuSide,
} from "#components";

describe("MenuSide", () => {
  mockNuxtImport("useI18n", () => {
    return () => ({
      t: vi.fn((msg: string) => msg),
    });
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
    expect(expandIcon.attributes().class).toContain("h-4 w-4");
    expect(toggleExpandButton.element.title).toContain("expand");
  });

  it("should have the awaited style when the menu is expanded", async () => {
    expect(menuSide.find("nav").attributes().class).toContain("ml-4 my-4");
    expect(menuSide.findComponent(BaseImage).attributes().class).toContain(
      "h-12 w-12",
    );

    const menuSideCustom = await mountSuspended(MenuSide);
    let toggleExpandButton = menuSideCustom.find(
      "[data-cy='toggle-expand-btn']",
    );

    await toggleExpandButton.trigger("click");

    toggleExpandButton = menuSideCustom.find("[data-cy='toggle-expand-btn']");

    expect(menuSideCustom.find("nav").attributes().class).not.toContain(
      "ml-4 my-4",
    );
    expect(toggleExpandButton.attributes().title).toBe("abate");
    expect(
      menuSideCustom.findComponent(BaseImage).attributes().class,
    ).toContain("h-[5.3rem]");
    expect(
      toggleExpandButton.findComponent(IconExpandRightDouble).attributes()
        .class,
    ).toContain("translate rotate-180 h-5 w-5");
  });

  describe("Menu items", () => {
    const menus = [
      {
        title: "dashboard",
        icon: "DASHBOARD",
        path: "/dashboard",
      },
    ];

    it("should render the menu items", () => {
      const menuItems = menuSide.findAllComponents(MenuItem);
      expect(menuItems.length).toBe(1);
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
      expect(menuItems.length).toBe(1);
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

    it("should render the menu with awaited props `isSelected` as true when we are on the designated menu", async () => {
      mockedUseRouteHoisted.mockRestore();
      const currentRoutePath = "/dashboard";
      mockedUseRouteHoisted.mockImplementation(() => {
        return {
          path: "/dashboard",
        };
      });

      const menuSideCustom = await mountSuspended(MenuSide);
      const menuItems = menuSideCustom.findAllComponents(MenuItem);
      expect(menuItems.length).toBe(1);
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
