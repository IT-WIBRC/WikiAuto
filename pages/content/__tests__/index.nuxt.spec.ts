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
import BaseButtonIcon from "~/components/base/button/icon.vue";
import AddIcon from "~/components/icon/add.vue";
import BadgeList from "~/components/badge/list.vue";
import useToast from "~/utils/use-toast";
import ContentCreate from "~/components/content/create.vue";

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
            name: "badge-service 1",
          },
        ],
        updated_at: "2024-12-14 18:45:28",
      },
      {
        content_id: "123456",
        status: "Validated",
        title: "My title 2",
        user_email: "email2@email.com",
        badges: [
          {
            name: "badge-service 10",
          },
          {
            name: "badge-service 11",
          },
          {
            name: "badge-service 12",
          },
        ],
        updated_at: "2024-12-18 13:25:08",
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

    it("should display the content correctly", async () => {
      const isMontageShallow = false;
      await mountWithData(isMontageShallow);
      const rowItems = contentListWrapper.findAll("[data-cy='table-row']");
      expect(rowItems.length).toBe(2);
      rowItems.forEach((rowItem, index) => {
        const tableData = rowItem.findAll("td");
        expect(tableData.length).toBe(4);
        expect(tableData[0].text()).toBe(contents[index].title);
        const emailRow = tableData[1];
        const emailValue = contents[index].user_email;
        expect(emailRow.find("a").attributes().href).toBe(
          `mailto:${emailValue}`,
        );
        expect(tableData[1].text()).toBe(emailValue);

        const badgesListComponent = tableData[2].findComponent(BadgeList);
        const badgesList = contents[index].badges;
        expect(badgesListComponent.props()).toEqual({
          badges: badgesList.map((badge) => badge.name),
          badgeLengthOnLG: 2,
          badgeLengthOnXL: 4,
          badgeLengthOnMoreThanXL: 5,
        });

        const status = tableData[3].findComponent(BadgeStatus);
        expect(status.exists()).toBe(true);
        expect(status.exists()).toBe(true);
        expect(status.props()).toEqual({
          theme: contents[index].status.toLowerCase(),
          text: contents[index].status,
        });
      });
    });
  });

  describe("Content create", () => {
    it("should render the button to go the content create page", () => {
      const contentCreateButton =
        contentListWrapper.findComponent(BaseButtonIcon);
      expect(contentCreateButton.exists()).toBe(true);
      expect(contentCreateButton.props().text).toBe("add_btn");
      expect(contentCreateButton.findComponent(AddIcon).exists()).toBe(true);
    });

    it("should open the content create form when we click on the create button", async () => {
      expect(contentListWrapper.findComponent(ContentCreate).exists()).toBe(
        false,
      );
      await contentListWrapper.findComponent(BaseButtonIcon).trigger("click");
      expect(contentListWrapper.findComponent(ContentCreate).exists()).toBe(
        true,
      );
    });
  });
});
