import { beforeAll, describe, expect, it } from "vitest";
import type { VueWrapper } from "@vue/test-utils";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { IconDashboard, MenuItem } from "#components";

describe("MenuItem", () => {
  let menuItem: VueWrapper;
  beforeAll(async () => {
    menuItem = await mountSuspended(MenuItem, {
      props: {
        icon: "DASHBOARD",
        title: "dashboard",
        path: "/dashboard",
      },
    });
  });

  it("should render correctly", () => {
    expect(menuItem.exists()).toBe(true);
  });

  it("should render the dashboard icon", () => {
    const dashboardIcon = menuItem.findComponent(IconDashboard);
    expect(dashboardIcon.exists()).toBe(true);
    expect(dashboardIcon.attributes().class).toBe("h-5 w-5 fill-gray-400");
  });

  it("should render the path", () => {
    const menuItemDashboard = menuItem.find("[data-cy='item-dashboard']");
    expect(menuItemDashboard.exists()).toBe(true);
    expect(menuItemDashboard.attributes().href).toBe("/dashboard");
  });

  it("should display the title and have the awaited style when the menu is opened", async () => {
    let menuTitle = menuItem.find("[data-cy='menu-title']");
    expect(menuTitle.exists()).toBe(false);

    expect(
      menuItem.find("[data-cy='item-dashboard']").attributes().class,
    ).not.toContain("text-[#3A36DB] rounded-sm pr-9");

    const menuItemCustom = await mountSuspended(MenuItem, {
      props: {
        icon: "DASHBOARD",
        title: "dashboard",
        path: "/dashboard",
        isOpened: true,
      },
    });

    menuTitle = menuItemCustom.find("[data-cy='menu-title']");
    expect(menuTitle.exists()).toBe(true);
    expect(menuTitle.text()).toBe("dashboard");
    expect(
      menuItemCustom.find("[data-cy='item-dashboard']").attributes().class,
    ).toContain("text-[#3A36DB] rounded-sm pr-9");
  });

  it("should have the awaited style when the menu item is selected", async () => {
    expect(
      menuItem.find("[data-cy='item-dashboard']").attributes().class,
    ).not.toContain("text-[#3A36DB] rounded-sm px-4");
    expect(menuItem.find("[data-cy='selected-style']").exists()).toBe(false);
    expect(menuItem.findComponent(IconDashboard).attributes().class).toBe(
      "h-5 w-5 fill-gray-400",
    );

    const menuItemCustom = await mountSuspended(MenuItem, {
      props: {
        icon: "DASHBOARD",
        title: "dashboard",
        path: "/dashboard",
        isSelected: true,
      },
    });

    expect(
      menuItemCustom.find("[data-cy='item-dashboard']").attributes().class,
    ).toContain("text-[#3A36DB] rounded-sm px-4");
    expect(menuItemCustom.find("[data-cy='selected-style']").exists()).toBe(
      true,
    );
    expect(menuItemCustom.findComponent(IconDashboard).attributes().class).toBe(
      "h-5 w-5 fill-[#3A36DB]",
    );
  });
});
