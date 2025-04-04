import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { VueWrapper } from "@vue/test-utils";
import { Dropdown, IconMore } from "#components";
import { mountSuspended } from "@nuxt/test-utils/runtime";

describe("Dropdown", () => {
  let dropdown: VueWrapper;
  beforeAll(async () => {
    dropdown = await mountSuspended(Dropdown, {
      slots: {
        options: "<p>Options</p>",
      },
    });
  });

  afterAll(() => {
    document.body.innerHTML = "";
  });

  it("should render correctly", () => {
    expect(dropdown.exists()).toBe(true);
  });

  it("should render the 'more' icon", () => {
    expect(dropdown.findComponent(IconMore).exists()).toBe(true);
  });

  it("should not render the options by default", () => {
    expect(dropdown.find("[data-cy='options']").exists()).toBe(false);
  });

  it("should render the options when we click on the open button an hide when click again", async () => {
    const openBtn = dropdown.find("[data-cy='open']");
    expect(openBtn.exists()).toBe(true);

    await openBtn.trigger("click");

    let dropdownOptions = dropdown.find("[data-cy='options']");
    expect(dropdownOptions.exists()).toBe(true);

    await openBtn.trigger("click");

    dropdownOptions = dropdown.find("[data-cy='options']");
    expect(dropdownOptions.exists()).toBe(false);
  });

  it("should render the options when we open them", async () => {
    expect(dropdown.find("[data-cy='options']").exists()).toBe(false);

    await dropdown.find("[data-cy='open']").trigger("click");

    expect(dropdown.find("[data-cy='options']").exists()).toBe(true);

    expect(dropdown.text()).toContain("Options");
  });
});
