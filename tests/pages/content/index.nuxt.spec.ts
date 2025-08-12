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
import ContentList from "~/pages/content/index.vue";
import { useContentStore } from "~/stores/content.store";
import IconBlankContent from "~/components/icon/BlankContent.vue";
import DataTable, { type DataItem } from "~/components/DataTable.vue";
import type { GetContentListItem } from "~/api";
import BadgeStatus from "~/components/badge/Status.vue";
import BaseButtonIcon from "~/components/base/button/icon.vue";
import BadgeList from "~/components/badge/list.vue";
import ContentCreate from "~/components/content/create.vue";
import IconKeyboardArrowDown from "~/components/icon/KeyboardArrowDown.vue";
import ContentRowDetails from "~/components/content/rowDetails.vue";
import BaseNoData from "~/components/base/no-data.vue";
import { nextTick } from "vue";
import { getMockUseToastInstance } from "~/tests/mocks/mockUseToast";
import testUtils from "~/tests/utils/ui";

const { toastAssertions, getPiniaInstance, getMockContentList } = testUtils;

const mockUseToast = getMockUseToastInstance();

vi.mock("~/composables/useToast", () => ({
  useToast: vi.fn(() => mockUseToast),
}));

describe("ContentList", () => {
  const pinia = getPiniaInstance({ stubActions: true });
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
    const emptyContent = contentListWrapper.findComponent(BaseNoData);
    expect(emptyContent.exists()).toBe(true);
    expect(emptyContent.findComponent(IconBlankContent).exists()).toBe(true);
    expect(emptyContent.props().message).toBe("not_content");
  });

  describe("On error", () => {
    it("should display the toast error message when the request fails", async () => {
      const contentStore = useContentStore(pinia);
      contentStore.fetchContentList = vi.fn().mockResolvedValueOnce({
        status: "error",
        message: "REQUEST_FAILED",
      });
      contentListWrapper = await mountSuspended(ContentList, {
        shallow: true,
        global: {
          plugins: [pinia],
        },
      });
      toastAssertions.expectErrorCalled("generic_errors.REQUEST_FAILED", {
        position: "bottom-right",
        durationInSecond: 15,
      });
    });
  });

  describe("With data", () => {
    const contents = getMockContentList();
    const mountWithData = async (isShallowMontage = true): Promise<void> => {
      contentStore.fetchContentList = vi.fn().mockResolvedValueOnce({
        status: "success",
        data: contents,
      });
      contentListWrapper = await mountSuspended(ContentList, {
        shallow: isShallowMontage,
        global: {
          plugins: [pinia],
          stubs: {
            rowDetails: true,
          },
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
      expect(contentListWrapper.exists()).toBe(true);
    });

    it("should not render the no content", () => {
      expect(
        contentListWrapper.find("[data-cy='empty-content-list']").exists(),
      ).toBe(false);
    });

    it("should render the awaited props", () => {
      type HeaderKeys = "title" | "email" | "badges" | "status";
      class DataForContent implements DataItem<string> {
        constructor(private content: GetContentListItem) {}

        getTextFor(key: HeaderKeys): string | string[] | number {
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
          value: "headers.created_by_th",
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
      const isShallowMontage = false;
      await mountWithData(isShallowMontage);
      const rowItems = contentListWrapper.findAll("[data-cy='table-row']");
      expect(rowItems.length).toBe(2);
      rowItems.forEach((rowItem, index) => {
        const tableData = rowItem.findAll("td");
        expect(tableData.length).toBe(5);

        expect(
          tableData.at(0)?.findComponent(IconKeyboardArrowDown).exists(),
        ).toBe(true);

        expect(tableData[1].text()).toBe(contents[index].title);
        const emailRow = tableData[2];
        const emailValue = contents[index].user_email;
        expect(emailRow.find("a").attributes().href).toBe(
          `mailto:${emailValue}`,
        );
        expect(tableData[2].text()).toBe(emailValue);

        const badgesListComponent = tableData[3].findComponent(BadgeList);
        const badgesList = contents[index].badges;
        expect(badgesListComponent.props()).toEqual({
          badges: badgesList.map((badge) => badge.name),
          badgeLengthOnLG: 2,
          badgeLengthOnXL: 4,
          badgeLengthOnMoreThanXL: 5,
        });

        const status = tableData[4].findComponent(BadgeStatus);
        expect(status.exists()).toBe(true);
        expect(status.exists()).toBe(true);
        expect(status.props()).toEqual({
          theme: contents[index].status.toLowerCase(),
          text: contents[index].status,
        });
      });
    });

    it("should open the content details when we click on the open arrow icon", async () => {
      const isShallowMontage = false;
      await mountWithData(isShallowMontage);
      expect(contentListWrapper.findComponent(ContentRowDetails).exists()).toBe(
        false,
      );

      await contentListWrapper
        .findAll("[data-cy='table-row']")[0]
        .find("td")
        .findComponent(IconKeyboardArrowDown)
        .trigger("click");

      expect(contentListWrapper.findComponent(ContentRowDetails).exists()).toBe(
        true,
      );
      expect(
        contentListWrapper.findComponent(ContentRowDetails).props().id,
      ).toBe("123456");
    });

    it("should reopen the content detail after edition and updating the list", async () => {
      const isShallowMontage = false;
      await mountWithData(isShallowMontage);

      let contentDetail = contentListWrapper.findComponent(ContentRowDetails);
      expect(contentDetail.exists()).toBe(false);

      await contentListWrapper
        .findAll("[data-cy='table-row']")[0]
        .find("td")
        .findComponent(IconKeyboardArrowDown)
        .trigger("click");

      contentDetail = contentListWrapper.findComponent(ContentRowDetails);
      expect(contentDetail.exists()).toBe(true);

      contentStore.fetchContentList = vi.fn().mockResolvedValueOnce({
        status: "success",
        data: contents,
      });

      contentDetail.vm.$emit("edited", contentDetail.props().id);
      await flushPromises();
      expect(contentStore.fetchContentList).toHaveBeenCalledTimes(1);

      expect(contentDetail.props().id).toBe("123456");
    });
  });

  describe("Content create", () => {
    beforeEach(async () => {
      contentStore.fetchContentList = vi.fn().mockResolvedValueOnce({
        status: "success",
        data: [],
      });
      contentListWrapper = await mountSuspended(ContentList, {
        shallow: true,
        global: {
          plugins: [pinia],
          stubs: {
            teleport: true,
            rowDetails: true,
            clientOnly: false,
          },
        },
      });
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it("should render the button to go the content create page", async () => {
      const contentCreateButton =
        contentListWrapper.findComponent(BaseButtonIcon);
      expect(contentCreateButton.exists()).toBe(true);
      expect(contentCreateButton.props().text).toBe("add_btn");
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

    it("should close the content create form when we click on the close icon button", async () => {
      let creationForm = contentListWrapper.findComponent(ContentCreate);
      expect(creationForm.exists()).toBe(false);

      await contentListWrapper.findComponent(BaseButtonIcon).trigger("click");

      creationForm = contentListWrapper.findComponent(ContentCreate);
      expect(creationForm.exists()).toBe(true);

      creationForm.vm.$emit("close");
      await nextTick();

      creationForm = contentListWrapper.findComponent(ContentCreate);
      expect(creationForm.exists()).toBe(false);
    });

    it("should get the new content when we the creation succeed", async () => {
      expect(contentStore.fetchContentList).toHaveBeenCalledTimes(1);

      let creationForm = contentListWrapper.findComponent(ContentCreate);
      expect(creationForm.exists()).toBe(false);

      await contentListWrapper.findComponent(BaseButtonIcon).trigger("click");

      creationForm = contentListWrapper.findComponent(ContentCreate);
      expect(creationForm.exists()).toBe(true);

      contentStore.fetchContentList = vi.fn().mockResolvedValueOnce({
        status: "success",
        data: [],
      });

      creationForm.vm.$emit("created");
      await nextTick();
      await flushPromises();

      expect(contentStore.fetchContentList).toHaveBeenCalledTimes(1);
    });
  });
});
