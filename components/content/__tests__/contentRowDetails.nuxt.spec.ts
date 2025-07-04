import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  vi,
  beforeEach,
} from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { useContentStore } from "~/stores/content.store";
import {
  Badge,
  BadgeStatus,
  BaseImage,
  ContentDetailWrapper,
  ContentEdit,
  ContentRowDetails,
  Dropdown,
  IconEdit,
  IconStatus,
  ModalStatusUpdate,
} from "#components";
import type { VueWrapper } from "@vue/test-utils";
import testUtils from "~/tests/utils";

const { getPiniaInstance, getMockContentList } = testUtils;

const contents = getMockContentList();

describe("ContentRowDetails", () => {
  let contentRowDetailsWrapper: VueWrapper;
  const pinia = getPiniaInstance({ stubActions: true });

  const contentStore = useContentStore(pinia);
  contentStore.contentList = contents;
  contentStore.getImageURLFrom = vi.fn().mockReturnValue({
    status: "success",
    data: "http://localhost/image.png",
  });

  beforeAll(async () => {
    contentRowDetailsWrapper = await mountSuspended(ContentRowDetails, {
      props: {
        id: "123456",
      },
      global: {
        plugins: [pinia],
        stubs: {
          edit: true,
        },
      },
    });
  });

  afterAll(() => {
    vi.resetAllMocks();
    vi.clearAllMocks();
  });

  it("should render correctly", () => {
    expect(contentRowDetailsWrapper.exists()).toBe(true);
  });

  it("should render the content image", async () => {
    expect(contentStore.getImageURLFrom).toHaveBeenCalledTimes(1);
    expect(contentStore.getImageURLFrom).toHaveBeenCalledWith(
      contents[1].image,
    );

    const contentImage = contentRowDetailsWrapper.findComponent(BaseImage);
    expect(contentImage.exists()).toBe(true);
    expect(contentImage.props()).toEqual({
      alt: contents[1].title,
      name: contents[1].title,
      srcUrl: "http://localhost/image.png",
      loading: "eager",
      fetchPriority: "high",
    });
  });

  it("should render the awaited status", () => {
    const contentStatus =
      contentRowDetailsWrapper.findComponent(ContentDetailWrapper);
    expect(contentStatus.exists()).toBe(true);
    expect(contentStatus.props().label).toBe("status_lbl");

    const contentBadgeStatus = contentStatus.findComponent(BadgeStatus);
    expect(contentBadgeStatus.exists()).toBe(true);
    expect(contentBadgeStatus.props()).toEqual({
      text: contents[1].status,
      theme: contents[1].status.toLowerCase(),
    });
  });

  it("should render the awaited email of the user who created the content", () => {
    const contentUserEmail =
      contentRowDetailsWrapper.findAllComponents(ContentDetailWrapper)[1];
    expect(contentUserEmail.exists()).toBe(true);
    expect(contentUserEmail.props().label).toBe("created_by_lbl");

    expect(contentUserEmail.find("a").attributes("href")).toBe(
      `mailto:${contents[1].user_email}`,
    );
    expect(contentUserEmail.find("address").text()).toBe(
      contents[1].user_email,
    );
  });

  it("should render the awaited created date", () => {
    const contentCreatedDate =
      contentRowDetailsWrapper.findAllComponents(ContentDetailWrapper)[2];
    expect(contentCreatedDate.exists()).toBe(true);
    expect(contentCreatedDate.props().label).toBe("created_at_lbl");

    expect(contentCreatedDate.find("time").text()).toBe(
      useDate.format(contents[1].created_at),
    );
  });

  it("should render the awaited updated date", () => {
    const contentUpdatedDate =
      contentRowDetailsWrapper.findAllComponents(ContentDetailWrapper)[3];
    expect(contentUpdatedDate.exists()).toBe(true);
    expect(contentUpdatedDate.props().label).toBe("updated_at_lbl");

    expect(contentUpdatedDate.find("time").text()).toBe(
      useDate.format(contents[1].updated_at),
    );
  });

  it("should render the awaited title", () => {
    const contentTitle =
      contentRowDetailsWrapper.findAllComponents(ContentDetailWrapper)[4];
    expect(contentTitle.exists()).toBe(true);
    expect(contentTitle.props().label).toBe("title_lbl");

    expect(contentTitle.find("h1").text()).toBe(contents[1].title);
  });

  it("should render the awaited badges", () => {
    const contentBadges =
      contentRowDetailsWrapper.findAllComponents(ContentDetailWrapper)[5];
    expect(contentBadges.exists()).toBe(true);
    expect(contentBadges.props().label).toBe("badges_lbl");

    const badges = contentBadges.findAllComponents(Badge);
    expect(badges.length).toBe(3);

    contents[1].badges.forEach((badge, index) => {
      expect(badges[index].props()).toEqual({
        text: badge.name,
      });
    });
  });

  it("should render the awaited explanation", () => {
    const contentExplanation =
      contentRowDetailsWrapper.findAllComponents(ContentDetailWrapper)[6];
    expect(contentExplanation.exists()).toBe(true);
    expect(contentExplanation.props().label).toBe("explanation_lbl");

    expect(contentExplanation.find("[data-cy='value']").text()).toBe(
      contents[1].explanation,
    );
  });

  describe("Edition", () => {
    it("should render the button to edit the content", async () => {
      await openDropdown(contentRowDetailsWrapper);

      const editBtn = contentRowDetailsWrapper.find("[data-cy='edit-btn']");
      expect(editBtn.exists()).toBe(true);
      expect(editBtn.findComponent(IconEdit).exists()).toBe(true);
    });

    it("should open the form to edit the content when we click on the edit button", async () => {
      let editFormComponent =
        contentRowDetailsWrapper.findComponent(ContentEdit);
      expect(editFormComponent.exists()).toBe(false);

      await contentRowDetailsWrapper
        .find("[data-cy='edit-btn']")
        .trigger("click");

      editFormComponent = contentRowDetailsWrapper.findComponent(ContentEdit);
      expect(editFormComponent.exists()).toBe(true);
      expect(editFormComponent.props().id).toBe(contents[1].content_id);
    });

    it("should close the edition form when we receive the `close` event", async () => {
      contentRowDetailsWrapper = await mountSuspended(ContentRowDetails, {
        props: {
          id: "123456",
        },
        global: {
          plugins: [pinia],
          stubs: {
            edit: true,
          },
        },
      });

      let editContentForm = contentRowDetailsWrapper.findComponent(ContentEdit);
      expect(editContentForm.exists()).toBe(false);

      await openDropdown(contentRowDetailsWrapper);

      await contentRowDetailsWrapper
        .find("[data-cy='edit-btn']")
        .trigger("click");

      editContentForm = contentRowDetailsWrapper.findComponent(ContentEdit);
      expect(editContentForm.exists()).toBe(true);

      editContentForm.vm.$emit("close");
      await nextTick();

      editContentForm = contentRowDetailsWrapper.findComponent(ContentEdit);
      expect(editContentForm.exists()).toBe(false);
    });

    it("should emit the `edited` event with the edited content id when the edition is done", async () => {
      const contentRowDetailsWrapper = await mountSuspended(ContentRowDetails, {
        props: {
          id: "123456",
        },
        global: {
          plugins: [pinia],
          stubs: {
            edit: true,
          },
        },
      });

      let editContentForm2 =
        contentRowDetailsWrapper.findComponent(ContentEdit);
      expect(editContentForm2.exists()).toBe(false);

      await openDropdown(contentRowDetailsWrapper);

      await contentRowDetailsWrapper
        .find("[data-cy='edit-btn']")
        .trigger("click");

      editContentForm2 = contentRowDetailsWrapper.findComponent(ContentEdit);
      expect(editContentForm2.exists()).toBe(true);

      editContentForm2.vm.$emit("edited", 12345);
      await nextTick();

      expect(contentRowDetailsWrapper.emitted()).toHaveProperty("edited", [
        [contents[1].content_id],
      ]);
    });
  });

  describe("Status Edition", () => {
    beforeEach(async () => {
      contentRowDetailsWrapper = await mountSuspended(ContentRowDetails, {
        props: {
          id: "123456",
        },
        global: {
          plugins: [pinia],
          stubs: {
            statusUpdate: true,
            transition: false,
          },
        },
      });
    });

    it("should render the button to update the status the content", async () => {
      await openDropdown(contentRowDetailsWrapper);
      const updateStatusBtn = contentRowDetailsWrapper.find(
        "[data-cy='update-status-btn']",
      );
      expect(updateStatusBtn.exists()).toBe(true);
      expect(updateStatusBtn.findComponent(IconStatus).exists()).toBe(true);
    });

    it("should open the form to edit the change status when we click on the 'update status' button", async () => {
      let editStatusFormComponent =
        contentRowDetailsWrapper.findComponent(ModalStatusUpdate);
      expect(editStatusFormComponent.exists()).toBe(false);

      await openDropdown(contentRowDetailsWrapper);
      await contentRowDetailsWrapper
        .find("[data-cy='update-status-btn']")
        .trigger("click");

      editStatusFormComponent =
        contentRowDetailsWrapper.findComponent(ModalStatusUpdate);
      expect(editStatusFormComponent.exists()).toBe(true);
      expect(editStatusFormComponent.props()).toEqual({
        contentId: contents[1].content_id,
        currentStatus: contents[1].status,
      });
    });

    it("should close the status edition form when we receive the `close` event", async () => {
      let editContentStatusForm =
        contentRowDetailsWrapper.findComponent(ModalStatusUpdate);
      expect(editContentStatusForm.exists()).toBe(false);

      await openDropdown(contentRowDetailsWrapper);

      await contentRowDetailsWrapper
        .find("[data-cy='update-status-btn']")
        .trigger("click");

      editContentStatusForm =
        contentRowDetailsWrapper.findComponent(ModalStatusUpdate);
      expect(editContentStatusForm.exists()).toBe(true);

      editContentStatusForm.vm.$emit("close");
      await nextTick();

      editContentStatusForm =
        contentRowDetailsWrapper.findComponent(ModalStatusUpdate);
      expect(editContentStatusForm.exists()).toBe(false);
    });

    it("should emit the `edited` event with the edited content id when the status edition is done", async () => {
      let editContentStatusForm2 =
        contentRowDetailsWrapper.findComponent(ModalStatusUpdate);
      expect(editContentStatusForm2.exists()).toBe(false);

      await openDropdown(contentRowDetailsWrapper);

      await contentRowDetailsWrapper
        .find("[data-cy='update-status-btn']")
        .trigger("click");

      editContentStatusForm2 =
        contentRowDetailsWrapper.findComponent(ModalStatusUpdate);
      expect(editContentStatusForm2.exists()).toBe(true);

      editContentStatusForm2.vm.$emit("updated");
      await nextTick();

      expect(contentRowDetailsWrapper.emitted()).toHaveProperty("edited", [
        [contents[1].content_id],
      ]);
    });
  });

  const openDropdown = async (wrapper: VueWrapper) => {
    const dropdown = wrapper.findComponent(Dropdown);
    expect(dropdown.exists()).toBe(true);
    await dropdown.find("[data-cy='open']").trigger("click");

    expect(dropdown.find("[data-cy='options']").exists()).toBe(true);
  };
});
