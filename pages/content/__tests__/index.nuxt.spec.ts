import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { VueWrapper } from "@vue/test-utils";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import ContentList from "../index.vue";
import { createTestingPinia } from "@pinia/testing";
import { useContentStore } from "../../../stores/content.store";
import IconBlankContent from "~/components/icon/BlankContent.vue";
import DataTable, { type DataItem } from "~/components/DataTable.vue";
import type { GetContentListType } from "../../../api/types";
import BadgeStatus from "~/components/badge/Status.vue";
import Badge from "~/components/badge/index.vue";
import useToast from "~/utils/use-toast";

describe("ContentList", () => {
  mockNuxtImport("useI18n", () => {
    return () => ({
      t: vi.fn((msg: string) => msg),
    });
  });

  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: true,
  });
  const contentStore = useContentStore(pinia);
  contentStore.fetchContentList = vi.fn().mockResolvedValueOnce({
    status: "success",
    data: [],
  });
  let contentListWrapper: VueWrapper;
  beforeAll(async () => {
    contentListWrapper = await mountSuspended(ContentList, {
      shallow: true,
      global: {
        plugins: [pinia],
      },
    });
  });

  afterAll(() => {
    vi.resetModules();
  });

  it("should render correctly", () => {
    expect(contentListWrapper.exists()).toBe(true);
  });

  it("should display the title", () => {
    expect(
      contentListWrapper.find("[data-cy='content-list-title']").text(),
    ).toBe("ttl");
  });

  it("should render the awaited content when there is no data", () => {
    const emptyContentList = contentListWrapper.find(
      "[data-cy='empty-content-list']",
    );
    expect(emptyContentList.exists()).toBe(true);
    expect(emptyContentList.findComponent(IconBlankContent).exists()).toBe(
      true,
    );
    expect(emptyContentList.find("[data-cy='no-content']").text()).toBe(
      "not_content",
    );
  });

  describe("On error", () => {
    it("should display the toast error message when the request fails", async () => {
      const contentStore = useContentStore(pinia);
      contentStore.fetchContentList = vi.fn().mockResolvedValueOnce({
        status: "error",
        message: "REQUEST_FAILED",
      });
      useToast.error = vi.fn();
      contentListWrapper = await mountSuspended(ContentList, {
        shallow: true,
        global: {
          plugins: [pinia],
        },
      });
      expect(useToast.error).toHaveBeenCalledTimes(1);
      expect(useToast.duration).toBe(15);
      expect(useToast.error).toHaveBeenCalledWith(
        "generic_errors.REQUEST_FAILED",
      );
    });
  });

  describe("With data", () => {
    const contents = [
      {
        content_id: "12345",
        status: "Validated",
        title: "My title",
        user_email: "email@email.com",
        badges: [
          {
            name: "badge 1",
          },
        ],
        updated_at: "2024-12-14 18:45:28"
      },
      {
        content_id: "123456",
        status: "Validated",
        title: "My title 2",
        user_email: "email2@email.com",
        badges: [
          {
            name: "badge 10",
          },
          {
            name: "badge 11",
          },
          {
            name: "badge 12",
          },
        ],
        updated_at: "2024-12-18 13:25:08"
      },
    ];
    const mountWithData = async (isMontageShallow = true) => {
      contentStore.fetchContentList = vi.fn().mockResolvedValueOnce({
        status: "success",
        data: contents,
      });
      contentListWrapper = await mountSuspended(ContentList, {
        shallow: isMontageShallow,
        global: {
          plugins: [pinia],
        },
      });
    };
    beforeAll(async () => {
      await mountWithData();
    });

    it("should render correctly", () => {
      expect(contentListWrapper.exists()).toBe(true);
    });

    it("should not render the no content", () => {
      expect(
        contentListWrapper.find("[data-cy='empty-content-list']").exists(),
      ).toBe(false);
    });

    it("should render the awaited props", () => {
      class DataForContent implements DataItem<string> {
        constructor(private content: GetContentListType) {}

        getTextFor(key: Keys): string | string[] | number {
          switch (key) {
            case "title":
              return this.content.title;
            case "email":
              return this.content.user_email;
            case "status":
              return this.content.status;
            case "badges":
              return this.content.badges.map((badge) => badge.name);
            default:
              return "-";
          }
        }

        get id(): string {
          return this.content.content_id;
        }
      }
      const dataTable = contentListWrapper.findComponent(DataTable);
      expect(dataTable.exists()).toBe(true);
      expect(dataTable.props().headers).toEqual([
        {
          key: "title",
          value: "headers.title_th",
        },
        {
          key: "email",
          value: "headers.email_th",
        },
        {
          key: "badges",
          value: "headers.badge_th",
        },
        {
          key: "status",
          value: "headers.status_th",
        },
      ]);

      expect(dataTable.props().items).toEqual(
        contents.map((content) => new DataForContent(content)),
      );
    });

    it("should display the row content", async () => {
      const isMontageShallow = false;
      await mountWithData(isMontageShallow);
      const rowItems = contentListWrapper.findAll("[data-cy='table-row']");
      expect(rowItems.length).toBe(2);
      rowItems.forEach((rowItem, index) => {
        const tableData = rowItem.findAll("td");
        expect(tableData.length).toBe(4);
        expect(tableData[0].text()).toBe(contents[index].title);
        expect(tableData[1].text()).toBe(contents[index].user_email);

        const badgesComponents = tableData[2].findAllComponents(Badge);
        const badgesList = contents[index].badges;
        expect(badgesComponents.length).toBe(badgesList.length);
        badgesComponents.forEach((badge, badgeIndex) => {
          expect(badge.props().text).toBe(badgesList[badgeIndex].name);
        });

        const status = tableData[3].findComponent(BadgeStatus);
        expect(status.exists()).toBe(true);
        expect(status.props()).toEqual({
          theme: contents[index].status.toLowerCase(),
          text: contents[index].status,
        });
      });
    });
  });
});
