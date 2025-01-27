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
import { flushPromises, type VueWrapper } from "@vue/test-utils";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import {
  ContentCreate,
  IconAdd,
  InputFileImage,
  InputRichText,
  InputText,
  SelectMultipleForBadge,
} from "#components";
import { createTestingPinia } from "@pinia/testing";
import { GenericErrors } from "~/api/types";

describe("ContentCreate", () => {
  mockNuxtImport("useI18n", () => {
    return () => ({
      t: vi.fn((msg: string) => msg),
    });
  });
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    stubActions: true,
  });

  let contentCreate: VueWrapper;
  beforeAll(async () => {
    vi.setSystemTime(new Date("2023-10-08"));
    contentCreate = await mountSuspended(ContentCreate, {
      global: {
        plugins: [pinia],
      },
    });
  });

  afterAll(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
    vi.useRealTimers();
  });

  it("should render correctly", () => {
    expect(contentCreate.exists()).toBe(true);
  });

  it("should display the content title", () => {
    expect(contentCreate.find("[data-cy='content-create-title']").text()).toBe(
      "ttl",
    );
  });

  it("should render the button to close the creation form", () => {
    const closeCreateContentForm = contentCreate.find(
      "[data-cy='close-create-content-form']",
    );
    expect(closeCreateContentForm.exists()).toBe(true);
    expect(closeCreateContentForm.findComponent(IconAdd).exists()).toBe(true);
  });

  it("should render the field to fill the content image", () => {
    const illustrationField = contentCreate.findComponent(InputFileImage);
    expect(illustrationField.exists()).toBe(true);
    expect(illustrationField.props()).toEqual({
      label: "fields.illustration.lbl",
      modelValue: new File([], "", { lastModified: 1696723200000 }),
    });
  });

  it("should render the field to fill the content title", () => {
    const titleField = contentCreate.findComponent(InputText);
    expect(titleField.exists()).toBe(true);
    expect(titleField.props()).toEqual({
      label: "fields.title.lbl",
      placeholder: "fields.title.ph",
      modelValue: "",
      limitCharacter: 100,
      isRequired: true,
      hasError: false,
    });
  });

  it("should render the field to fill the content badges", () => {
    const selectBadgeField = contentCreate.findComponent(
      SelectMultipleForBadge,
    );
    expect(selectBadgeField.exists()).toBe(true);
    expect(selectBadgeField.props()).toEqual({
      label: "fields.badge.lbl",
      placeholder: "fields.badge.ph",
      modelValue: [],
      isRequired: true,
    });
  });

  it("should render the field to fill the content explanation", () => {
    const explanationField = contentCreate.findComponent(InputRichText);
    expect(explanationField.exists()).toBe(true);
    expect(explanationField.props()).toEqual({
      label: "fields.explanation.lbl",
      placeholder: "fields.explanation.ph",
      modelValue: "",
      isRequired: true,
    });
  });

  it("should render the button to create the content", () => {
    const createContentBtn = contentCreate.find("[data-cy='create-btn']");
    expect(createContentBtn.exists()).toBe(true);
    expect(createContentBtn.text()).toBe("fields.button.create");
  });

  it("should render the button to create the content and continue", () => {
    const createContinueContentBtn = contentCreate.find(
      "[data-cy='create-continue-btn']",
    );
    expect(createContinueContentBtn.exists()).toBe(true);
    expect(createContinueContentBtn.text()).toBe(
      "fields.button.create_continue",
    );
  });

  it("should emit the `close` event when we click on the close button", async () => {
    await contentCreate
      .find("[data-cy='close-create-content-form']")
      .trigger("click");
    expect(contentCreate.emitted()).toHaveProperty("close");
  });

  describe("Error cases", () => {
    it("should display an error message when we want to submit an empty form", async () => {
      contentCreate = await mountSuspended(ContentCreate, {
        global: {
          plugins: [pinia],
        },
      });

      await contentCreate.findComponent(InputFileImage).setValue(new Blob([]));
      await contentCreate.find("[data-cy='create-btn']").trigger("submit");

      await flushPromises();
      await flushPromises();
      await flushPromises();

      expect(
        contentCreate.findComponent(InputFileImage).props().errorMessage,
      ).toBe("_file");
      expect(contentCreate.findComponent(InputText).props().errorMessage).toBe(
        "_min",
      );
      expect(
        contentCreate.findComponent(SelectMultipleForBadge).props()
          .errorMessage,
      ).toBe("_min");
      expect(
        contentCreate.findComponent(InputRichText).props().errorMessage,
      ).toBe("_min");
    });

    describe("Field: Title", () => {
      afterEach(() => {
        vi.restoreAllMocks();
      });

      it("should display an error message when the title entered has less than 10 characters", async () => {
        contentCreate = await mountSuspended(ContentCreate, {
          global: {
            plugins: [pinia],
          },
        });

        let title = contentCreate.findComponent(InputText);
        await title.setValue("test less");

        await contentCreate.find("[data-cy='create-btn']").trigger("submit");

        await flushPromises();
        await flushPromises();
        await flushPromises();

        title = contentCreate.findComponent(InputText);
        expect(title.props().errorMessage).toBe("_min");
      });

      it("should display an error message when the title entered has more than 100 characters", async () => {
        contentCreate = await mountSuspended(ContentCreate, {
          global: {
            plugins: [pinia],
          },
        });

        let title = contentCreate.findComponent(InputText);
        await title.setValue(
          "test with more than one hundred characters for testing wikiAuto application title for content creation",
        );

        await contentCreate.find("[data-cy='create-btn']").trigger("submit");

        await flushPromises();
        await flushPromises();
        await flushPromises();
        await flushPromises();

        title = contentCreate.findComponent(InputText);
        expect(title.props().errorMessage).toBe("_max");
      });
    });

    describe("Field: Explanation", () => {
      afterEach(() => {
        vi.restoreAllMocks();
      });

      it("should display an error message when the explanation entered has less than 20 characters", async () => {
        contentCreate = await mountSuspended(ContentCreate, {
          global: {
            plugins: [pinia],
          },
        });

        let explanation = contentCreate.findComponent(InputRichText);
        await explanation.setValue("test with less");

        await contentCreate.find("[data-cy='create-btn']").trigger("submit");

        await flushPromises();
        await flushPromises();
        await flushPromises();

        explanation = contentCreate.findComponent(InputRichText);
        expect(explanation.props().errorMessage).toBe("_min");
      });
    });

    describe("Field: Illustration", () => {
      afterEach(() => {
        vi.restoreAllMocks();
      });

      it("should display an error message when the illustration size is `0` or more than `200kb`", async () => {
        contentCreate = await mountSuspended(ContentCreate, {
          global: {
            plugins: [pinia],
          },
        });

        let illustration = contentCreate.findComponent(InputFileImage);
        await illustration.setValue(
          new File([""], "test.png", { type: "image/png" }),
        );

        await contentCreate.find("[data-cy='create-btn']").trigger("submit");

        await flushPromises();
        await flushPromises();
        await flushPromises();

        illustration = contentCreate.findComponent(InputFileImage);
        expect(illustration.props().errorMessage).toBe("_size");
      });

      it("should display an error message when the illustration has a non supported extension", async () => {
        contentCreate = await mountSuspended(ContentCreate, {
          global: {
            plugins: [pinia],
          },
        });

        let illustration = contentCreate.findComponent(InputFileImage);

        const fakeFile = new File([""], "fake.ts", { type: "text/ts" });
        Object.defineProperty(fakeFile, "size", { value: 1024 * 100 });

        await illustration.setValue(fakeFile);

        await contentCreate.find("[data-cy='create-btn']").trigger("submit");

        await flushPromises();
        await flushPromises();
        await flushPromises();

        illustration = contentCreate.findComponent(InputFileImage);
        expect(illustration.props().errorMessage).toBe("_fileTypes");
      });
    });

    it("should display an error message when we receive one from the api", async () => {
      const contentStore = useContentStore(pinia);

      contentCreate = await mountSuspended(ContentCreate, {
        global: {
          plugins: [pinia],
        },
        attachTo: document.body,
      });

      const imageTestFile = new File([""], "image.png", { type: "image/png" });
      Object.defineProperty(imageTestFile, "size", { value: 1024 * 100 });

      await contentCreate.findComponent(InputFileImage).setValue(imageTestFile);
      await contentCreate.findComponent(InputText).setValue("Driving licence");
      const selectedBadges = [
        {
          badge_id: 3,
          name: "shoutcast",
        },
        {
          badge_id: 4,
          name: "icecast",
        },
      ];
      await contentCreate
        .findComponent(SelectMultipleForBadge)
        .setValue(selectedBadges);
      await contentCreate
        .findComponent(InputRichText)
        .setValue("<p>This is useful when we cant to deal with police</p>");

      contentStore.create = vi.fn().mockReturnValueOnce({
        status: "error",
        message: GenericErrors.BAD_REQUEST,
      });
      useToast.error = vi.fn();
      await contentCreate.find("[data-cy='create-btn']").trigger("submit");

      await flushPromises();
      await flushPromises();
      await flushPromises();

      expect(useToast.error).toHaveBeenCalledTimes(1);
      expect(useToast.error).toHaveBeenCalledWith("generic_errors.BAD_REQUEST");

      expect(contentStore.create).toHaveBeenCalledTimes(1);
      expect(contentStore.create).toHaveBeenCalledWith({
        title: "Driving licence",
        explanation: "<p>This is useful when we cant to deal with police</p>",
        illustration: imageTestFile,
        badges: [...selectedBadges],
      });
      vi.clearAllMocks();
    });
  });

  describe("Successful cases", () => {
    let contentStore: ReturnType<typeof useContentStore>;
    const imageFile = new File([""], "image.png", { type: "image/png" });
    Object.defineProperty(imageFile, "size", { value: 1024 * 110 });

    beforeEach(async () => {
      contentStore = useContentStore(pinia);
      contentStore.create = vi.fn().mockReturnValue({
        status: "success",
      });

      contentCreate = await mountSuspended(ContentCreate, {
        global: {
          plugins: [pinia],
        },
      });
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it("should emit the awaited events when the creation is successful", async () => {
      await contentCreate.findComponent(InputText).setValue("Driving licence");
      await contentCreate.findComponent(InputFileImage).setValue(imageFile);
      const selectedBadges = [
        {
          badge_id: 3,
          name: "shoutcast",
        },
        {
          badge_id: 4,
          name: "icecast",
        },
      ];
      await contentCreate
        .findComponent(SelectMultipleForBadge)
        .setValue(selectedBadges);
      await contentCreate
        .findComponent(InputRichText)
        .setValue("<p>This is useful when we cant to deal with police</p>");

      useToast.success = vi.fn();
      await contentCreate.find("[data-cy='create-btn']").trigger("submit");

      await flushPromises();
      await flushPromises();
      await flushPromises();

      expect(useToast.success).toHaveBeenCalledOnce();
      expect(useToast.success).toHaveBeenCalledWith("succeed");

      expect(contentStore.create).toHaveBeenCalledTimes(1);
      expect(contentStore.create).toHaveBeenCalledWith({
        title: "Driving licence",
        explanation: "<p>This is useful when we cant to deal with police</p>",
        illustration: imageFile,
        badges: [...selectedBadges],
      });

      expect(contentCreate.emitted()).toHaveProperty("created");
      expect(contentCreate.emitted()).toHaveProperty("close");
    });

    it("should emit the awaited events when we click on the `create and continue button`", async () => {
      await contentCreate.findComponent(InputFileImage).setValue(imageFile);
      await contentCreate.findComponent(InputText).setValue("Driving licence");
      const selectedBadges = [
        {
          badge_id: 3,
          name: "shoutcast",
        },
        {
          badge_id: 4,
          name: "icecast",
        },
      ];
      await contentCreate
        .findComponent(SelectMultipleForBadge)
        .setValue(selectedBadges);
      await contentCreate
        .findComponent(InputRichText)
        .setValue("<p>This is useful when we cant to deal with police</p>");

      useToast.success = vi.fn();
      await contentCreate
        .find("[data-cy='create-continue-btn']")
        .trigger("click");

      await flushPromises();
      await flushPromises();
      await flushPromises();

      expect(useToast.success).toHaveBeenCalledTimes(1);
      expect(useToast.success).toHaveBeenCalledWith("succeed");

      expect(contentStore.create).toHaveBeenCalledTimes(1);
      expect(contentStore.create).toHaveBeenCalledWith({
        title: "Driving licence",
        explanation: "<p>This is useful when we cant to deal with police</p>",
        illustration: imageFile,
        badges: [...selectedBadges],
      });

      expect(contentCreate.emitted()).toHaveProperty("created");

      expect(
        contentCreate.findComponent(InputFileImage).props().modelValue,
      ).toEqual(new File([], "", { lastModified: 1696723200000 }));
      expect(contentCreate.findComponent(InputText).props().modelValue).toBe(
        "",
      );
      expect(
        contentCreate.findComponent(InputRichText).props().modelValue,
      ).toBe("");
      expect(
        contentCreate.findComponent(SelectMultipleForBadge).props().modelValue,
      ).toEqual([]);
    });
  });
});
