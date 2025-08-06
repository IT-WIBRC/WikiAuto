import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import type { VueWrapper } from "@vue/test-utils";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import {
  ContentEdit,
  IconAdd,
  InputFileImage,
  InputRichText,
  InputText,
  SelectCustomForContentStatus,
  SelectMultipleForBadge,
} from "#components";
import { useContentStore } from "~/stores/content.store";
import { flushPromises as vueFlushPromises } from "@vue/test-utils";
import { CONTENT_STATUS, GenericErrors } from "~/api";
import testUtils from "~/tests/utils/ui";
import { getMockUseToastInstance } from "~/tests/mocks/mockUseToast";

const {
  getPiniaInstance,
  toastAssertions,
  getMockContentList,
  getMockBadges,
  mockFetch,
  createFile,
  flushPromises,
} = testUtils;
const mockUseToast = getMockUseToastInstance();

const contents = getMockContentList();
const badges = getMockBadges();

describe("ContentEdit", () => {
  const pinia = getPiniaInstance({ stubActions: true });

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
  mockFetch(imageResponseBlob);

  vi.mock("~/composables/useToast", () => ({
    useToast: vi.fn(() => mockUseToast),
  }));

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
    await vueFlushPromises();
    await vueFlushPromises();
  });

  beforeEach(() => {
    mockUseToast.reset();
  });

  afterAll(() => {
    vi.clearAllTimers();
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
      modelValue: createFile({
        name: contents[0].image,
        type: "image/png",
        size: 1024_00,
        content: imageResponseBlob,
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
    expect(createContentBtn.element.disabled).toBe(true);
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

  describe("Error cases", () => {
    beforeEach(async () => {
      vi.clearAllMocks();
      vi.useRealTimers();
      vi.useFakeTimers();
      contentEdit = await mountSuspended(ContentEdit, {
        props: {
          id: contents[0].content_id,
        },
        global: {
          plugins: [pinia],
        },
      });

      await flushPromises(contentEdit);
    });

    afterAll(() => {
      vi.useRealTimers();
    });

    it("should display an error message when we want to submit an empty form", async () => {
      await contentEdit
        .findComponent(InputFileImage)
        .setValue(new File([], ""));
      await contentEdit.findComponent(InputText).setValue("");
      await contentEdit.findComponent(InputRichText).setValue("");
      await contentEdit.findComponent(SelectMultipleForBadge).setValue([]);

      await contentEdit.find("[data-cy='edit-btn']").trigger("submit");
      await flushPromises(contentEdit);

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
        let title = contentEdit.findComponent(InputText);
        await title.setValue("test less");

        await contentEdit.find("[data-cy='edit-btn']").trigger("submit");
        await flushPromises(contentEdit);

        title = contentEdit.findComponent(InputText);
        expect(title.props().errorMessage).toBe("_min");
      });

      it("should display an error message when the title entered has more than 100 characters", async () => {
        let title = contentEdit.findComponent(InputText);
        await title.setValue(
          "test with more than one hundred characters for testing wikiAuto application title for content creation",
        );

        await contentEdit.find("[data-cy='edit-btn']").trigger("submit");
        await flushPromises(contentEdit);

        title = contentEdit.findComponent(InputText);
        expect(title.props().errorMessage).toBe("_max");
      });
    });

    describe("Field: Explanation", () => {
      it("should display an error message when the explanation entered has less than 20 characters", async () => {
        let explanation = contentEdit.findComponent(InputRichText);
        await explanation.setValue("test with less");

        await contentEdit.find("[data-cy='edit-btn']").trigger("submit");
        await flushPromises(contentEdit);

        explanation = contentEdit.findComponent(InputRichText);
        expect(explanation.props().errorMessage).toBe("_min");
      });
    });

    describe("Field: Illustration", () => {
      it("should display an error message when the illustration size is `0` or more than `200kb`", async () => {
        vi.clearAllMocks();

        let illustration = contentEdit.findComponent(InputFileImage);
        await illustration.setValue(
          new File([""], "test.png", { type: "image/png" }),
        );

        await contentEdit.find("[data-cy='edit-btn']").trigger("submit");

        await flushPromises(contentEdit);

        illustration = contentEdit.findComponent(InputFileImage);
        expect(illustration.props().errorMessage).toBe("_size");
      });

      it("should display an error message when the illustration has a non supported extension", async () => {
        let illustration = contentEdit.findComponent(InputFileImage);

        const fakeFile = createFile({
          name: "fake.ts",
          type: "text/ts",
          size: 1024_00,
        });

        await illustration.setValue(fakeFile);

        await contentEdit.find("[data-cy='edit-btn']").trigger("submit");

        await flushPromises(contentEdit);

        illustration = contentEdit.findComponent(InputFileImage);
        expect(illustration.props().errorMessage).toBe("_fileTypes");
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
      await flushPromises(contentEdit);

      const imageTestFile = createFile({
        name: contents[0].image,
        type: "image/png",
        size: 1024_00,
        content: imageResponseBlob,
      });

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

      await contentEdit.find("[data-cy='edit-btn']").trigger("submit");

      await flushPromises(contentEdit);

      toastAssertions.expectErrorCalled("generic_errors.BAD_REQUEST", {
        durationInSecond: 10,
        position: "top-right",
      });

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

    beforeAll(async () => {
      vi.useRealTimers();
      vi.useFakeTimers();
      imageFile = createFile({
        name: "image.png",
        type: "image/png",
        size: 1024 * 110,
      });

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

      await flushPromises(contentEdit);
    });

    afterAll(() => {
      vi.useRealTimers();
      vi.clearAllMocks();
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

      await contentEdit.find("[data-cy='edit-btn']").trigger("submit");

      await flushPromises(contentEdit);

      toastAssertions.expectSuccessCalled("succeed", {
        position: "top-right",
        durationInSecond: 12,
      });

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
