import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { VueWrapper } from "@vue/test-utils";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { Badge, BadgeList } from "#components";
import useUnitTestUtils from "~/tests/utils";

describe("BadgeList", () => {
  let badgeListWrapper: VueWrapper;
  const baseBadges = [
    "badge 0",
    "badge 1",
    "badge 2",
    "badge 3",
    "badge 4",
    "badge 5",
    "badge 6",
  ] as const;
  let badges: string[] = [];

  const mountBadgeList = async (): Promise<void> => {
    badgeListWrapper = await mountSuspended(BadgeList, {
      props: {
        badges,
        badgeLengthOnLG: 2,
        badgeLengthOnXL: 4,
        badgeLengthOnMoreThanXL: 5,
      },
    });
  };

  it("should render correctly", async () => {
    await mountBadgeList();
    expect(badgeListWrapper.exists()).toBe(true);
  });

  describe("Large size (LG)", () => {
    it("should render the badges correctly without remaining", async () => {
      badges = baseBadges.slice(0, 2);
      await mountBadgeList();
      const badgesComponents = badgeListWrapper.findAllComponents(Badge);
      expect(badgesComponents.length).toBe(2);
      badgesComponents.forEach((badgeComponent, index) => {
        expect(badgeComponent.props().text).toBe(badges[index]);
      });
      expect(
        badgeListWrapper.find("[data-cy='remainingBadges']").exists(),
      ).toBe(false);
    });

    it("should render the badges correctly with remaining", async () => {
      badges = baseBadges.slice(0, 3);
      await mountBadgeList();
      const badgesComponents = badgeListWrapper.findAllComponents(Badge);
      expect(badgesComponents.length).toBe(2);
      badgesComponents.forEach((badgeComponent, index) => {
        expect(badgeComponent.props().text).toBe(badges[index]);
      });
      const remainingBadges = badgeListWrapper.find(
        "[data-cy='remainingBadges']",
      );
      expect(remainingBadges.exists()).toBe(true);
      expect(remainingBadges.text()).toBe("+1");
    });
  });

  describe("Extra Large size (XL)", () => {
    beforeEach(() => {
      useUnitTestUtils.spyOnScreenSize(1280);
    });

    afterAll(() => {
      vi.clearAllMocks();
    });

    it("should render the badges correctly without remaining", async () => {
      badges = baseBadges.slice(0, 3);
      await mountBadgeList();
      const badgesComponents = badgeListWrapper.findAllComponents(Badge);
      expect(badgesComponents.length).toBe(3);
      badgesComponents.forEach((badgeComponent, index) => {
        expect(badgeComponent.props().text).toBe(badges[index]);
      });
      expect(
        badgeListWrapper.find("[data-cy='remainingBadges']").exists(),
      ).toBe(false);
    });

    it("should render the badges correctly with remaining", async () => {
      badges = baseBadges.slice(0, 6);
      await mountBadgeList();
      const badgesComponents = badgeListWrapper.findAllComponents(Badge);
      expect(badgesComponents.length).toBe(4);
      badgesComponents.forEach((badgeComponent, index) => {
        expect(badgeComponent.props().text).toBe(badges[index]);
      });
      const remainingBadges = badgeListWrapper.find(
        "[data-cy='remainingBadges']",
      );
      expect(remainingBadges.exists()).toBe(true);
      expect(remainingBadges.text()).toBe("+2");
    });
  });

  describe("More than Extra Large size (2XL, ...)", () => {
    beforeEach(() => {
      useUnitTestUtils.spyOnScreenSize(1536);
    });

    afterAll(() => {
      vi.clearAllMocks();
    });

    it("should render the badges correctly without remaining", async () => {
      badges = baseBadges.slice(0, 5);
      await mountBadgeList();
      const badgesComponents = badgeListWrapper.findAllComponents(Badge);
      expect(badgesComponents.length).toBe(5);
      badgesComponents.forEach((badgeComponent, index) => {
        expect(badgeComponent.props().text).toBe(badges[index]);
      });
      expect(
        badgeListWrapper.find("[data-cy='remainingBadges']").exists(),
      ).toBe(false);
    });

    it("should render the badges correctly with remaining", async () => {
      badges = baseBadges.slice(0, 6);
      await mountBadgeList();
      const badgesComponents = badgeListWrapper.findAllComponents(Badge);
      expect(badgesComponents.length).toBe(5);
      badgesComponents.forEach((badgeComponent, index) => {
        expect(badgeComponent.props().text).toBe(badges[index]);
      });
      const remainingBadges = badgeListWrapper.find(
        "[data-cy='remainingBadges']",
      );
      expect(remainingBadges.exists()).toBe(true);
      expect(remainingBadges.text()).toBe("+1");
    });
  });
});
