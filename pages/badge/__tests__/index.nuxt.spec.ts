import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import type { VueWrapper } from "@vue/test-utils";
import { flushPromises } from "@vue/test-utils";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import BadgeList from "../index.vue";
import { createTestingPinia } from "@pinia/testing";
import { useBadgeStore } from "~/stores/badge.store";
import useToast from "~/utils/use-toast";
import IconBadge from "~/components/icon/badge.vue";
import AddIcon from "~/components/icon/add.vue";
import BaseNoData from "~/components/base/no-data.vue";
import BaseButtonIcon from "~/components/base/button/icon.vue";
import CardBadge from "~/components/card/badge.vue";

describe("BadgeList", () => {
  mockNuxtImport("useI18n", () => {
    return () => ({
      t: vi.fn((msg: string) => msg),
    });
  });

  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: true,
  });
  const badgeStore = useBadgeStore(pinia);
  badgeStore.fetchBadgeList = vi.fn().mockResolvedValueOnce({
    status: "success",
    data: [],
  });
  let badgeListWrapper: VueWrapper;
  beforeAll(async () => {
    badgeListWrapper = await mountSuspended(BadgeList, {
      global: {
        plugins: [pinia],
        stubs: {
          teleport: true
        }
      },
    });
  });

  afterAll(() => {
    vi.resetModules();
  });

  it("should render correctly", () => {
    expect(badgeListWrapper.exists()).toBe(true);
  });

  it("should display the title", () => {
    expect(badgeListWrapper.find("[data-cy='badge-list-title']").text()).toBe(
      "ttl",
    );
  });

  it("should render the awaited badge when there is no data", () => {
    const emptyContent = badgeListWrapper.findComponent(BaseNoData);
    expect(emptyContent.exists()).toBe(true);
    expect(emptyContent.findComponent(IconBadge).exists()).toBe(true);
    expect(emptyContent.props().message).toBe("no_badge");
  });

  describe("On error", () => {
    it("should display the toast error message when the request fails", async () => {
      const badgeStore = useBadgeStore(pinia);
      badgeStore.fetchBadgeList = vi.fn().mockResolvedValueOnce({
        status: "error",
        message: "REQUEST_FAILED",
      });
      const toastError = vi.spyOn(useToast.prototype, "error");
      badgeListWrapper = await mountSuspended(BadgeList, {
        shallow: true,
        global: {
          plugins: [pinia],
        },
      });
      expect(toastError).toHaveBeenCalledTimes(1);
      expect(toastError).toHaveBeenCalledWith(
        "generic_errors.REQUEST_FAILED",
        false,
      );
    });
  });

  describe("With data", () => {
    const badges = [
      {
        badge_id: "12345",
        name: "My title",
        description: "email@email.com",
        updated_at: "2025-01-13 15:02:04",
        created_at: "2025-01-16 10:39:02"
      },
      {
        badge_id: "123456",
        name: "My title 2",
        description: "email2@email.com",
        updated_at: "2024-10-28 03:56:03",
        created_at: "2024-12-03 10:01:09"
      },
    ];
    const mountWithData = async (isShallowMontage = true): Promise<void> => {
      badgeStore.fetchBadgeList = vi.fn().mockResolvedValueOnce({
        status: "success",
        data: badges,
      });
      badgeListWrapper = await mountSuspended(BadgeList, {
        shallow: isShallowMontage,
        global: {
          plugins: [pinia],
        },
      });
    };

    beforeAll(async () => {
      await mountWithData();
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it("should render correctly", () => {
      expect(badgeListWrapper.exists()).toBe(true);
    });

    it("should not render the no badge message", () => {
      expect(
        badgeListWrapper.find("[data-cy='empty-badge-list']").exists(),
      ).toBe(false);
    });

    it("should display the content correctly", async () => {
      const isShallowMontage = false;
      await mountWithData(isShallowMontage);
      const badgeComponents = badgeListWrapper.findAllComponents(CardBadge);
      expect(badgeComponents.length).toBe(2);
      badgeComponents.forEach((badgeComponent, index) => {
        expect(badgeComponent.props()).toEqual({
          title: badges[index].name,
          description: badges[index].description,
        });
      });
    });
  });

  describe("Badge create", () => {
    it("should render the button to go the badge create page", () => {
      const badgeCreateButton =
          badgeListWrapper.findComponent(BaseButtonIcon);
      expect(badgeCreateButton.exists()).toBe(true);
      expect(badgeCreateButton.props().text).toBe("create_btn");
      expect(badgeCreateButton.findComponent(AddIcon).exists()).toBe(true);
    });

    it("should open the badge create form when we click on the create button", async () => {
      badgeStore.fetchBadgeList = vi.fn().mockResolvedValueOnce({
        status: "success",
        data: [],
      });
      const badgeListWrapper = await mountSuspended(BadgeList, {
        shallow: true,
        global: {
          plugins: [pinia],
          stubs: {
            teleport: true,
          }
        },
        attachTo: document.body,
      });
      await flushPromises();
      expect(badgeListWrapper.findComponent("client-only-stub").exists()).toBe(
        true
      );
    });
  });
});
