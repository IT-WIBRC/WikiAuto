import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import type { VueWrapper } from "@vue/test-utils";
import { flushPromises } from "@vue/test-utils";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import BadgeList from "~/pages/badge/index.vue";
import { useBadgeStore } from "~/stores/badge.store";
import IconBadge from "~/components/icon/badge.vue";
import BaseNoData from "~/components/base/no-data.vue";
import BaseButtonIcon from "~/components/base/button/icon.vue";
import CardBadge from "~/components/card/badge.vue";
import BadgeCreate from "~/components/badge/create.vue";
import BadgeEdit from "~/components/badge/edit.vue";
import { nextTick } from "vue";

import { getMockUseToastInstance } from "~/tests/mocks/mockUseToast";
import testUtils from "~/tests/utils/ui";

const { toastAssertions, getPiniaInstance } = testUtils;

const mockUseToast = getMockUseToastInstance();

vi.mock("~/composables/useToast", () => ({
  useToast: vi.fn(() => mockUseToast),
}));

describe("BadgeList", () => {
  const pinia = getPiniaInstance({ stubActions: true });

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
          teleport: true,
        },
      },
    });
  });

  beforeEach(() => {
    mockUseToast.reset();
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
      badgeListWrapper = await mountSuspended(BadgeList, {
        shallow: true,
        global: {
          plugins: [pinia],
        },
      });
      toastAssertions.expectErrorCalled("generic_errors.REQUEST_FAILED", {
        durationInSecond: 15,
        position: "bottom-right",
      });
    });
  });

  describe("With data", () => {
    const badges = [
      {
        badge_id: "12345",
        name: "My title",
        description: "email@email.com",
        updated_at: "2025-01-13 15:02:04",
        created_at: "2025-01-16 10:39:02",
      },
      {
        badge_id: "123456",
        name: "My title 2",
        description: "email2@email.com",
        updated_at: "2024-10-28 03:56:03",
        created_at: "2024-12-03 10:01:09",
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

  describe("Badge creation", () => {
    beforeEach(async () => {
      badgeStore.fetchBadgeList = vi.fn().mockResolvedValueOnce({
        status: "success",
        data: [
          {
            badge_id: "12345",
            name: "name 0",
            description: "description 0",
            updated_at: "2025-02-16 20:39:02",
          },
          {
            badge_id: "12346",
            name: "name 1",
            description: "description 1",
            updated_at: "2025-02-16 15:39:02",
          },
          {
            badge_id: "12347",
            name: "name 2",
            description: "description 2",
            updated_at: "2025-02-16 10:39:02",
          },
        ],
      });
      badgeListWrapper = await mountSuspended(BadgeList, {
        shallow: true,
        global: {
          plugins: [pinia],
          stubs: {
            teleport: true,
            ClientOnly: false,
            transition: false,
          },
        },
        attachTo: document.body,
      });
      await flushPromises();
    });

    afterEach(() => {
      vi.resetAllMocks();
    });

    it("should render the button to go the badge create page", () => {
      const badgeCreateButton = badgeListWrapper.findComponent(BaseButtonIcon);
      expect(badgeCreateButton.exists()).toBe(true);
      expect(badgeCreateButton.props().text).toBe("create_btn");
    });

    it("should open the badge creation form when we click on the create button", async () => {
      await badgeListWrapper.findComponent(BaseButtonIcon).trigger("click");
      await vi.dynamicImportSettled();

      expect(badgeListWrapper.findComponent(BadgeCreate).exists()).toBe(true);
    });

    it("should close the badge creation form when we click on the close button", async () => {
      await badgeListWrapper.findComponent(BaseButtonIcon).trigger("click");
      await vi.dynamicImportSettled();

      let creationForm = badgeListWrapper.findComponent(BadgeCreate);
      expect(creationForm.exists()).toBe(true);

      creationForm.vm.$emit("closed");
      await nextTick();

      creationForm = badgeListWrapper.findComponent(BadgeCreate);
      expect(creationForm.exists()).toBe(false);
    });

    it("should close the badge creation form and get the new list when we the creation has succeeded", async () => {
      await badgeListWrapper.findComponent(BaseButtonIcon).trigger("click");
      await vi.dynamicImportSettled();

      let creationForm = badgeListWrapper.findComponent(BadgeCreate);
      expect(creationForm.exists()).toBe(true);

      badgeStore.fetchBadgeList = vi.fn().mockResolvedValueOnce({
        status: "success",
        data: [],
      });

      creationForm.vm.$emit("created");
      await nextTick();
      await flushPromises();

      creationForm = badgeListWrapper.findComponent(BadgeCreate);
      expect(creationForm.exists()).toBe(false);

      expect(badgeStore.fetchBadgeList).toHaveBeenCalledTimes(1);
    });
  });

  describe("Badge edition", () => {
    beforeEach(async () => {
      badgeStore.fetchBadgeList = vi.fn().mockResolvedValueOnce({
        status: "success",
        data: [
          {
            badge_id: "12345",
            name: "name 0",
            description: "description 0",
            updated_at: "2025-02-16 18:39:02",
          },
          {
            badge_id: "12346",
            name: "name 1",
            description: "description 1",
            updated_at: "2025-02-16 15:39:02",
          },
          {
            badge_id: "12347",
            name: "name 2",
            description: "description 2",
            updated_at: "2025-02-16 10:39:02",
          },
        ],
      });
      badgeListWrapper = await mountSuspended(BadgeList, {
        shallow: true,
        global: {
          plugins: [pinia],
          stubs: {
            teleport: true,
            ClientOnly: false,
            transition: false,
          },
        },
        attachTo: document.body,
      });
      await flushPromises();
    });

    afterEach(() => {
      vi.resetAllMocks();
    });

    it("should open the badge edition form when we click on the edit icon on a tag card", async () => {
      expect(badgeStore.fetchBadgeList).toHaveBeenCalledTimes(1);

      badgeListWrapper.findComponent(CardBadge).vm.$emit("wantEdit");
      await vi.dynamicImportSettled();

      const editForm = badgeListWrapper.findComponent(BadgeEdit);
      expect(editForm.exists()).toBe(true);
      expect(editForm.attributes("id")).toBe("12345");
    });

    it("should close the badge edit form when we click on the 'close' icon on a tag card", async () => {
      badgeListWrapper.findComponent(CardBadge).vm.$emit("wantEdit");
      await vi.dynamicImportSettled();

      let editForm = badgeListWrapper.findComponent(BadgeEdit);
      expect(editForm.exists()).toBe(true);

      editForm.vm.$emit("closed");
      await nextTick();

      editForm = badgeListWrapper.findComponent(BadgeEdit);
      expect(editForm.exists()).toBe(false);
    });

    it("should close the badge edit form and get the new list when the edition has been done successfully", async () => {
      badgeListWrapper.findComponent(CardBadge).vm.$emit("wantEdit");
      await vi.dynamicImportSettled();

      let editForm = badgeListWrapper.findComponent(BadgeEdit);
      expect(editForm.exists()).toBe(true);

      badgeStore.fetchBadgeList = vi.fn().mockResolvedValueOnce({
        status: "success",
        data: [],
      });

      editForm.vm.$emit("edited");
      await nextTick();
      await flushPromises();

      editForm = badgeListWrapper.findComponent(BadgeEdit);
      expect(editForm.exists()).toBe(false);

      expect(badgeStore.fetchBadgeList).toHaveBeenCalledTimes(1);
    });
  });
});
