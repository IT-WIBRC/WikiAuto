import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { VueWrapper } from "@vue/test-utils";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { LazyLoaderFade, SelectBadgeList } from "#components";
import { BadgeToOptionForList } from "~/components/select/type";

describe("SelectBadgeList", () => {
  let selectBadgeList: VueWrapper;

  beforeEach(async () => {
    selectBadgeList = await mountSuspended(SelectBadgeList, {
      props: {
        areBadgeListLoading: false,
        options: [],
        searchingText: "",
      },
    });
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  it("should render correctly", () => {
    expect(selectBadgeList.exists()).toBe(true);
  });

  it("should display the awaited test when there is no badges", () => {
    const noData = selectBadgeList.find("[data-test='no-data']");
    expect(noData.exists()).toBe(true);
    expect(noData.text()).toBe("no_badges");
  });

  it("should display the awaited button to create the badge when the props `searchingText` is not empty", async () => {
    selectBadgeList = await mountSuspended(SelectBadgeList, {
      props: {
        areBadgeListLoading: false,
        options: [],
        searchingText: "text",
      },
    });
    const noData = selectBadgeList.find("[data-test='no-data']");
    expect(noData.exists()).toBe(true);
    expect(noData.text()).toBe("create «text»");
    await noData.find("[data-test='create-badge']").trigger("click");
    expect(selectBadgeList.emitted()).toHaveProperty("openCreationForm");
  });

  it("should render the loader on loading with no options", async () => {
    selectBadgeList = await mountSuspended(SelectBadgeList, {
      props: {
        areBadgeListLoading: true,
        options: [],
        searchingText: "text",
      },
    });
    expect(selectBadgeList.find("[data-test='option']").exists()).toBe(false);
    expect(selectBadgeList.findComponent(LazyLoaderFade).exists()).toBe(true);
  });

  it("should display the awaited options", async () => {
    const options = [
      {
        badge_id: 1,
        name: "Radio",
      },
      {
        badge_id: 4,
        name: "icecast",
      },
    ].map((badge) => new BadgeToOptionForList(badge, []));
    selectBadgeList = await mountSuspended(SelectBadgeList, {
      props: {
        areBadgeListLoading: false,
        options,
        searchingText: "text",
      },
    });
    expect(selectBadgeList.findComponent(LazyLoaderFade).exists()).toBe(false);
    const optionsList = selectBadgeList.findAll("[data-test='option']");
    expect(optionsList.length).toBe(2);
    options.forEach((option, index) => {
      expect(optionsList[index].text()).toBe(option.displayedValue);
      expect(optionsList[index].find("input").element.checked).toBe(
        option.isSelected,
      );
    });

    await optionsList[0].trigger("click");
    expect(selectBadgeList.emitted()).toHaveProperty("selectedBadge", [
      [options[0]],
    ]);
  });
});
