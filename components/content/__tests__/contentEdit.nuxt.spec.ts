import {
  afterAll,
  beforeAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import type { VueWrapper } from "@vue/test-utils";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import {
  ContentEdit,
  IconAdd,
  InputFileImage,
  InputRichText,
  InputText,
  SelectCustomForContentStatus,
  SelectMultipleForBadge,
} from "#components";
import { createTestingPinia } from "@pinia/testing";
import { useContentStore } from "~/stores/content.store";
import { flushPromises } from "@vue/test-utils";
import { CONTENT_STATUS, GenericErrors } from "~/api/types";

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

const badges = [
  {
    badge_id: 1,
    name: "Radio",
  },
  {
    badge_id: 2,
    name: "Radio 2",
  },
  {
    badge_id: 3,
    name: "shoutcast",
  },
  {
    badge_id: 4,
    name: "icecast",
  },
] as const;

describe("ContentEdit", () => {
  mockNuxtImport("useI18n", () => {
    return () => ({
      t: vi.fn((msg: string) => msg),
    });
  });
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: true,
  });

  const badgeSore = useBadgeStore(pinia);
  badgeSore.fetchBadgeListForOptions = vi.fn().mockReturnValue({
    status: "success",
    data: badges,
  });

  const contentStore = useContentStore(pinia);
  contentStore.contentList = contents;
  contentStore.getImageURLFrom = vi
    .fn()
    .mockReturnValue({
      status: "success",
      data: "http://localhost/0.2354.png",
    })
    .mockReturnValue({
      status: "success",
      data: "http://localhost/0.3354.png",
    });

  const imageResponseBlob = new Blob(["image.png"], {
    type: "image/png",
  });
  global.fetch = vi.fn().mockImplementation(() =>
    Promise.resolve({
      blob: () => Promise.resolve(imageResponseBlob),
    }),
  );

  let contentEdit: VueWrapper;
  beforeAll(async () => {
    vi.setSystemTime(new Date(2023, 10, 8, 0, 0, 0, 0));
    contentEdit = await mountSuspended(ContentEdit, {
      props: {
        id: contents[0].content_id,
      },
      global: {
        plugins: [pinia],
      },
    });
    await flushPromises();
    await flushPromises();
  });

  afterAll(() => {
    vi.clearAllTimers();
    vi.resetAllMocks();
    vi.clearAllMocks();
  });

  it("should render correctly", () => {
    expect(contentEdit.exists()).toBe(true);
  });

  it("should display the content title", () => {
    expect(contentEdit.find("[data-cy='content-edit-title']").text()).toBe(
      "ttl",
    );
  });

  it("should render the button to close the edition form", () => {
    const closeCreateContentForm = contentEdit.find(
      "[data-cy='close-edit-content-form']",
    );
    expect(closeCreateContentForm.exists()).toBe(true);
    expect(closeCreateContentForm.findComponent(IconAdd).exists()).toBe(true);
  });

  it("should render the field to fill the content image", () => {
    const illustrationField = contentEdit.findComponent(InputFileImage);
    expect(illustrationField.exists()).toBe(true);
    expect(illustrationField.props()).toEqual({
      label: "fields.illustration.lbl",
      modelValue: new File([imageResponseBlob], contents[0].image, {
        lastModified: 1699401600000,
        type: "image/png",
      }),
    });
  });

  it("should render the field to fill the content title", () => {
    const titleField = contentEdit.findComponent(InputText);
    expect(titleField.exists()).toBe(true);
    expect(titleField.props()).toEqual({
      label: "fields.title.lbl",
      placeholder: "fields.title.ph",
      modelValue: contents[0].title,
      limitCharacter: 100,
      isRequired: true,
      hasError: false,
      errorMessage: "_min",
    });
  });

  it("should render the field to fill the content badges", () => {
    const selectBadgeField = contentEdit.findComponent(SelectMultipleForBadge);
    expect(selectBadgeField.exists()).toBe(true);
    expect(selectBadgeField.props()).toEqual({
      label: "fields.badge.lbl",
      placeholder: "fields.badge.ph",
      modelValue: contents[0].badges,
      isRequired: true,
    });
  });

  it("should render the field to fill the content explanation", () => {
    const explanationField = contentEdit.findComponent(InputRichText);
    expect(explanationField.exists()).toBe(true);
    expect(explanationField.props()).toEqual({
      label: "fields.explanation.lbl",
      placeholder: "fields.explanation.ph",
      modelValue: contents[0].explanation,
      isRequired: true,
      errorMessage: "_min",
    });
  });

  it("should render the field to select the content status", () => {
    const explanationField = contentEdit.findComponent(
      SelectCustomForContentStatus,
    );
    expect(explanationField.exists()).toBe(true);
    expect(explanationField.props()).toEqual({
      label: "fields.status_lbl",
      modelValue: contents[0].status,
      isRequired: true,
    });
  });

  it("should render the button to edit the content", () => {
    const createContentBtn = contentEdit.find("[data-cy='edit-btn']");
    expect(createContentBtn.exists()).toBe(true);
    expect(createContentBtn.text()).toBe("button.edit");
  });

  it("should render the button to cancel the edition", () => {
    const createContinueContentBtn = contentEdit.find("[data-cy='cancel-btn']");
    expect(createContinueContentBtn.exists()).toBe(true);
    expect(createContinueContentBtn.text()).toBe("button.cancel");
  });

  it("should emit the `close` event when we click on the close button", async () => {
    await contentEdit
      .find("[data-cy='close-edit-content-form']")
      .trigger("click");
    expect(contentEdit.emitted()).toHaveProperty("close");
  });

  describe.skip("Error cases", () => {
    afterEach(() => {
      vi.clearAllMocks();
      vi.clearAllTimers();
    });

    it("should display an error message when we want to submit an empty form", async () => {
      contentEdit = await mountSuspended(ContentEdit, {
        props: {
          id: contents[0].content_id,
        },
        global: {
          plugins: [pinia],
        },
      });
      await flushPromises();
      await flushPromises();

      await contentEdit
        .findComponent(InputFileImage)
        .setValue(new File([], ""));
      await contentEdit.findComponent(InputText).setValue("");
      await contentEdit.findComponent(InputRichText).setValue("");
      await contentEdit.findComponent(SelectMultipleForBadge).setValue([]);

      await contentEdit.find("[data-cy='edit-btn']").trigger("submit");
      await flushPromises();

      expect(
        contentEdit.findComponent(InputFileImage).props().errorMessage,
      ).toBe("_size");
      expect(contentEdit.findComponent(InputText).props().errorMessage).toBe(
        "_min",
      );
      expect(
        contentEdit.findComponent(SelectMultipleForBadge).props().errorMessage,
      ).toBe("_min");
      expect(
        contentEdit.findComponent(InputRichText).props().errorMessage,
      ).toBe("_min");
    });

    describe("Field: Title", () => {
      it("should display an error message when the title entered has less than 10 characters", async () => {
        contentEdit = await mountSuspended(ContentEdit, {
          props: {
            id: contents[0].content_id,
          },
          global: {
            plugins: [pinia],
          },
        });
        await flushPromises();
        await flushPromises();

        let title = contentEdit.findComponent(InputText);
        await title.setValue("test less");

        await contentEdit.find("[data-cy='edit-btn']").trigger("submit");
        await flushPromises();

        title = contentEdit.findComponent(InputText);
        expect(title.props().errorMessage).toBe("_min");
      });

      it("should display an error message when the title entered has more than 100 characters", async () => {
        contentEdit = await mountSuspended(ContentEdit, {
          props: {
            id: contents[0].content_id,
          },
          global: {
            plugins: [pinia],
          },
        });
        await flushPromises();
        await flushPromises();

        let title = contentEdit.findComponent(InputText);
        await title.setValue(
          "test with more than one hundred characters for testing wikiAuto application title for content creation",
        );

        await contentEdit.find("[data-cy='edit-btn']").trigger("submit");
        await flushPromises();
        await flushPromises();

        title = contentEdit.findComponent(InputText);
        expect(title.props().errorMessage).toBe("_max");
      });
    });

    describe("Field: Explanation", () => {
      it("should display an error message when the explanation entered has less than 20 characters", async () => {
        contentEdit = await mountSuspended(ContentEdit, {
          props: {
            id: contents[0].content_id,
          },
          global: {
            plugins: [pinia],
          },
        });
        await flushPromises();
        await flushPromises();

        let explanation = contentEdit.findComponent(InputRichText);
        await explanation.setValue("test with less");

        await contentEdit.find("[data-cy='edit-btn']").trigger("submit");
        await flushPromises();
        await flushPromises();

        explanation = contentEdit.findComponent(InputRichText);
        expect(explanation.props().errorMessage).toBe("_min");

        vi.clearAllMocks();
        vi.clearAllTimers();
      });
    });

    describe("Field: Illustration", () => {
      it("should display an error message when the illustration size is `0` or more than `200kb`", async () => {
        vi.clearAllMocks();

        contentEdit = await mountSuspended(ContentEdit, {
          props: {
            id: contents[0].content_id,
          },
          global: {
            plugins: [pinia],
          },
        });
        await flushPromises();
        await flushPromises();

        let illustration = contentEdit.findComponent(InputFileImage);
        await illustration.setValue(
          new File([""], "test.png", { type: "image/png" }),
        );

        await contentEdit.find("[data-cy='edit-btn']").trigger("submit");

        await flushPromises();
        await flushPromises();
        await flushPromises();
        await nextTick();

        illustration = contentEdit.findComponent(InputFileImage);
        expect(illustration.props().errorMessage).toBe("_size");

        vi.clearAllMocks();
        vi.clearAllTimers();
      });

      it("should display an error message when the illustration has a non supported extension", async () => {
        contentEdit = await mountSuspended(ContentEdit, {
          props: {
            id: contents[0].content_id,
          },
          global: {
            plugins: [pinia],
          },
        });
        await flushPromises();
        await flushPromises();

        let illustration = contentEdit.findComponent(InputFileImage);

        const fakeFile = new File([""], "fake.ts", { type: "text/ts" });
        Object.defineProperty(fakeFile, "size", { value: 1024 * 100 });

        await illustration.setValue(fakeFile);

        await contentEdit.find("[data-cy='edit-btn']").trigger("submit");

        await flushPromises();
        await flushPromises();
        await flushPromises();

        illustration = contentEdit.findComponent(InputFileImage);
        expect(illustration.props().errorMessage).toBe("_fileTypes");

        vi.clearAllMocks();
        vi.clearAllTimers();
      });
    });

    it("should display an error message when we receive one from the api", async () => {
      const contentStore = useContentStore(pinia);

      contentEdit = await mountSuspended(ContentEdit, {
        props: {
          id: contents[0].content_id,
        },
        global: {
          plugins: [pinia],
        },
        attachTo: document.body,
      });

      const imageTestFile = new File([imageResponseBlob], contents[0].image, {
        type: "image/png",
      });
      Object.defineProperty(imageTestFile, "size", { value: 1024 * 100 });

      await contentEdit.findComponent(InputFileImage).setValue(imageTestFile);
      await contentEdit.findComponent(InputText).setValue("Driving licence");
      const selectedBadges = [
        {
          badge_id: 3,
          name: "shoutcast",
          description: "description",
        },
        {
          badge_id: 4,
          name: "icecast",
          description: "description",
        },
      ];
      await contentEdit
        .findComponent(SelectMultipleForBadge)
        .setValue(selectedBadges);
      await contentEdit
        .findComponent(InputRichText)
        .setValue("<p>This is useful when we cant to deal with police</p>");

      contentStore.edit = vi.fn().mockReturnValueOnce({
        status: "error",
        message: GenericErrors.BAD_REQUEST,
      });
      const toastError = vi.spyOn(useToast.prototype, "error");
      await contentEdit.find("[data-cy='edit-btn']").trigger("submit");

      await flushPromises();
      await flushPromises();
      await flushPromises();

      expect(toastError).toHaveBeenCalledTimes(1);
      expect(toastError).toHaveBeenCalledWith(
        "generic_errors.BAD_REQUEST",
        false,
      );

      expect(contentStore.edit).toHaveBeenCalledTimes(1);
      expect(contentStore.edit).toHaveBeenCalledWith({
        title: "Driving licence",
        explanation: "<p>This is useful when we cant to deal with police</p>",
        illustration: imageTestFile,
        badges: [...selectedBadges],
        status: CONTENT_STATUS.VALIDATED,
        userEmail: "email@email.com",
        id: contents[0].content_id,
      });
      vi.clearAllMocks();
    });
  });

  describe("Successful cases", () => {
    let contentStore: ReturnType<typeof useContentStore>;
    let imageFile = new File([""], "image.png", { type: "image/png" });

    beforeEach(async () => {
      imageFile = new File([""], "image.png", { type: "image/png" });
      Object.defineProperty(imageFile, "size", { value: 1024 * 110 });

      contentStore = useContentStore(pinia);
      contentStore.edit = vi.fn().mockReturnValueOnce({
        status: "success",
      });

      contentEdit = await mountSuspended(ContentEdit, {
        props: {
          id: contents[0].content_id,
        },
        global: {
          plugins: [pinia],
        },
      });

      await flushPromises();
      await flushPromises();
    });

    afterAll(() => {
      vi.clearAllMocks();
      vi.clearAllTimers();
    });

    it("should emit the awaited events when the creation is successful", async () => {
      await contentEdit.findComponent(InputText).setValue("Driving licence");
      await contentEdit.findComponent(InputFileImage).setValue(imageFile);
      const selectedBadges = [
        {
          badge_id: 3,
          name: "shoutcast",
          description: "description",
        },
        {
          badge_id: 4,
          name: "icecast",
          description: "description",
        },
      ];
      await contentEdit
        .findComponent(SelectMultipleForBadge)
        .setValue(selectedBadges);

      await contentEdit.find("[data-cy-id='pending']").trigger("click");
      await contentEdit
        .findComponent(InputRichText)
        .setValue("<p>This is useful when we cant to deal with police</p>");

      const toastSuccess = vi.spyOn(useToast.prototype, "success");
      await contentEdit.find("[data-cy='edit-btn']").trigger("submit");

      await flushPromises();
      await flushPromises();
      await flushPromises();

      expect(toastSuccess).toHaveBeenCalledOnce();
      expect(toastSuccess).toHaveBeenCalledWith("succeed", false);

      expect(contentStore.edit).toHaveBeenCalledTimes(1);
      expect(contentStore.edit).toHaveBeenCalledWith({
        title: "Driving licence",
        explanation: "<p>This is useful when we cant to deal with police</p>",
        illustration: imageFile,
        badges: [...selectedBadges],
        status: CONTENT_STATUS.PENDING,
        id: contents[0].content_id,
        userEmail: "email@email.com",
      });

      expect(contentEdit.emitted()).toHaveProperty("edited");
      expect(contentEdit.emitted()).toHaveProperty("close");
    });
  });
});
