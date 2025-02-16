import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { createTestingPinia } from "@pinia/testing";
import { useContentStore } from "~/stores/content.store";
import {
  Badge,
  BadgeStatus,
  BaseImage,
  ContentDetailWrapper,
  ContentEdit,
  ContentRowDetails,
  IconEdit,
} from "#components";
import type { VueWrapper } from "@vue/test-utils";

describe("ContentRowDetails", () => {
  let contentRowDetailsWrapper: VueWrapper;
  mockNuxtImport("useI18n", () => {
    return () => ({
      t: vi.fn((msg: string) => msg),
    });
  });

  const contents = [
    {
      content_id: "12345",
      explanation: "Explanation 0",
      status: "VALIDATED",
      title: "My title",
      user_email: "email@email.com",
      image: "0.0251.png",
      badges: [
        {
          badge_id: "7b72146b-403c-4837-abe5-5d884af8cc35",
          description: "description 1",
          name: "badge-service 1",
        },
      ],
      updated_at: "2024-12-14 18:45:28",
      created_at: "2024-10-14 18:45:28",
    },
    {
      content_id: "123456",
      status: "PENDING",
      explanation: "Explanation 1",
      title: "My title 2",
      image: "0.0281.png",
      user_email: "email2@email.com",
      badges: [
        {
          badge_id: "68330b2f-1555-46cb-bc2f-c99a1afb5923",
          description: "description 10",
          name: "badge-service 10",
        },
        {
          badge_id: "29370a87-93e5-4548-b9c5-277701a64893",
          description: "description 2",
          name: "badge-service 11",
        },
        {
          badge_id: "b04b94f6-ac53-41bd-a051-cb5f2003f3db",
          description: "description 3",
          name: "badge-service 12",
        },
      ],
      updated_at: "2024-12-18 13:25:08",
      created_at: "2024-11-14 18:45:28",
    },
  ] as const;

  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: true,
  });

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
    it("should render the button to edit the content", () => {
      const editBtn = contentRowDetailsWrapper.find("[data-cy='edit-btn']");
      expect(editBtn.exists()).toBe(true);
      expect(editBtn.findComponent(IconEdit).exists()).toBe(true);
    });

    it("should open the content create form when we click on the create button", async () => {
      let editContent = contentRowDetailsWrapper.findComponent(ContentEdit);
      expect(editContent.exists()).toBe(false);

      await contentRowDetailsWrapper
        .find("[data-cy='edit-btn']")
        .trigger("click");

      editContent = contentRowDetailsWrapper.findComponent(ContentEdit);
      expect(editContent.exists()).toBe(true);
      expect(editContent.props().id).toBe(contents[1].content_id);
    });

    it("should close the edition component when we receive the `close` event", async () => {
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
});
