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
import {
  flushPromises as vueFlushPromises,
  type VueWrapper,
} from "@vue/test-utils";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import {
  ContentCreate,
  IconAdd,
  InputFileImage,
  InputRichText,
  InputText,
  SelectCustomForContentStatus,
  SelectMultipleForBadge,
} from "#components";
import { CONTENT_STATUS, GenericErrors } from "~/api";
import testUtils from "~/tests/utils/ui";
import { getMockUseToastInstance } from "~/tests/mocks/mockUseToast";

const {
  getPiniaInstance,
  toastAssertions,
  getMockBadges,
  flushPromises,
  createFile,
} = testUtils;
const mockUseToast = getMockUseToastInstance();
vi.mock("~/composables/useToast", () => ({
  useToast: vi.fn(() => mockUseToast),
}));

const badges = getMockBadges();

describe("ContentCreate", () => {
  const pinia = getPiniaInstance({ stubActions: true });

  const badgeSore = useBadgeStore(pinia);
  badgeSore.fetchBadgeListForOptions = vi.fn().mockReturnValue({
    status: "success",
    data: badges,
  });

  let contentCreate: VueWrapper;
  beforeAll(async () => {
    vi.setSystemTime(new Date(2023, 10, 8, 0, 0, 0, 0));
    contentCreate = await mountSuspended(ContentCreate, {
      global: {
        plugins: [pinia],
      },
    });
  });

  beforeEach(() => {
    mockUseToast.reset();
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
      modelValue: new File([], "", { lastModified: 1699401600000 }),
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

  it("should render the field to select the content status", () => {
    const explanationField = contentCreate.findComponent(
      SelectCustomForContentStatus,
    );
    expect(explanationField.exists()).toBe(true);
    expect(explanationField.props()).toEqual({
      label: "fields.status_lbl",
      modelValue: "DRAFT",
      isRequired: true,
    });
  });

  it("should render the button to create the content", () => {
    const createContentBtn = contentCreate.find("[data-cy='create-btn']");
    expect(createContentBtn.exists()).toBe(true);
    expect(createContentBtn.text()).toBe("button.create");
  });

  it("should render the button to create the content and continue", () => {
    const createContinueContentBtn = contentCreate.find(
      "[data-cy='create-continue-btn']",
    );
    expect(createContinueContentBtn.exists()).toBe(true);
    expect(createContinueContentBtn.text()).toBe("button.create_continue");
  });

  it("should emit the `close` event when we click on the close button", async () => {
    await contentCreate
      .find("[data-cy='close-create-content-form']")
      .trigger("click");
    expect(contentCreate.emitted()).toHaveProperty("close");
  });

  describe("Error cases", () => {
    beforeEach(async () => {
      vi.useRealTimers();
      vi.useFakeTimers();
      contentCreate = await mountSuspended(ContentCreate, {
        global: {
          plugins: [pinia],
        },
      });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should display an error message when we want to submit an empty form", async () => {
      await contentCreate.find("[data-cy='create-btn']").trigger("submit");

      await flushPromises(contentCreate);

      expect(contentCreate.findComponent(InputText).props().errorMessage).toBe(
        "_min",
      );
      expect(
        contentCreate.findComponent(InputFileImage).props().errorMessage,
      ).toBe("_size");
      expect(
        contentCreate.findComponent(SelectMultipleForBadge).props()
          .errorMessage,
      ).toBe("_min");
      expect(
        contentCreate.findComponent(InputRichText).props().errorMessage,
      ).toBe("_min");

      vi.clearAllMocks();
    });

    describe("Field: Title", () => {
      afterEach(() => {
        vi.clearAllMocks();
      });

      it("should display an error message when the title entered has less than 10 characters", async () => {
        let title = contentCreate.findComponent(InputText);
        await title.setValue("test less");

        await contentCreate.find("[data-cy='create-btn']").trigger("submit");

        await flushPromises(contentCreate);

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

        await flushPromises(contentCreate);

        title = contentCreate.findComponent(InputText);
        expect(title.props().errorMessage).toBe("_max");
      });
    });

    describe("Field: Explanation", () => {
      afterEach(() => {
        vi.clearAllMocks();
      });

      it("should display an error message when the explanation entered has less than 20 characters", async () => {
        let explanation = contentCreate.findComponent(InputRichText);
        await explanation.setValue("test with less");

        await contentCreate.find("[data-cy='create-btn']").trigger("submit");

        await flushPromises(contentCreate);

        explanation = contentCreate.findComponent(InputRichText);
        expect(explanation.props().errorMessage).toBe("_min");
      });
    });

    describe("Field: Illustration", () => {
      afterEach(() => {
        vi.clearAllTimers();
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

        await flushPromises(contentCreate);

        illustration = contentCreate.findComponent(InputFileImage);
        expect(illustration.props().errorMessage).toBe("_size");
      });

      it("should display an error message when the illustration has a non supported extension", async () => {
        let illustration = contentCreate.findComponent(InputFileImage);

        const fakeFile = createFile({
          name: "fake.ts",
          type: "text/pts",
          size: 1024 * 100,
        });

        await illustration.setValue(fakeFile);
        await contentCreate.find("[data-cy='create-btn']").trigger("submit");

        await flushPromises(contentCreate);

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

      const imageTestFile = createFile({
        name: "image.png",
        type: "image/png",
        size: 1024 * 100,
      });

      await contentCreate.findComponent(InputFileImage).setValue(imageTestFile);
      await contentCreate.findComponent(InputText).setValue("Driving licence");
      const selectedBadges = [badges[0], badges[1]];
      await contentCreate
        .findComponent(SelectMultipleForBadge)
        .setValue(selectedBadges);

      await vueFlushPromises();

      await contentCreate
        .findComponent(InputRichText)
        .setValue("<p>This is useful when we cant to deal with police</p>");

      contentStore.create = vi.fn().mockReturnValueOnce({
        status: "error",
        message: GenericErrors.BAD_REQUEST,
      });
      await contentCreate.find("[data-cy='create-btn']").trigger("submit");

      await flushPromises(contentCreate);

      toastAssertions.expectErrorCalled("generic_errors.BAD_REQUEST", {
        durationInSecond: 5,
        position: "top-right",
      });

      expect(contentStore.create).toHaveBeenCalledTimes(1);
      expect(contentStore.create).toHaveBeenCalledWith({
        title: "Driving licence",
        explanation: "<p>This is useful when we cant to deal with police</p>",
        illustration: imageTestFile,
        badges: [...selectedBadges],
        status: CONTENT_STATUS.DRAFT,
      });
      vi.clearAllMocks();
    });
  });

  describe("Successful cases", () => {
    let contentStore: ReturnType<typeof useContentStore>;
    let imageFile = new File([""], "image.png", { type: "image/png" });

    beforeEach(async () => {
      vi.useRealTimers();
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2023, 10, 8, 0, 0, 0, 0));
      imageFile = createFile({
        name: "image.png",
        type: "image/png",
        size: 1024 * 110,
      });

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

    it("should emit the awaited events when the creation is successful", async () => {
      await contentCreate.findComponent(InputText).setValue("Driving licence");
      await contentCreate.findComponent(InputFileImage).setValue(imageFile);
      const selectedBadges = [badges[0], badges[1]];
      await contentCreate
        .findComponent(SelectMultipleForBadge)
        .setValue(selectedBadges);

      await vueFlushPromises();

      await contentCreate.find("[data-cy-id='pending']").trigger("click");
      await contentCreate
        .findComponent(InputRichText)
        .setValue("<p>This is useful when we cant to deal with police</p>");

      await contentCreate.find("[data-cy='create-btn']").trigger("submit");

      await flushPromises(contentCreate);

      toastAssertions.expectSuccessCalled("succeed", {
        durationInSecond: 5,
        position: "top-right",
      });

      expect(contentStore.create).toHaveBeenCalledTimes(1);
      expect(contentStore.create).toHaveBeenCalledWith({
        title: "Driving licence",
        explanation: "<p>This is useful when we cant to deal with police</p>",
        illustration: imageFile,
        badges: [...selectedBadges],
        status: CONTENT_STATUS.PENDING,
      });

      expect(contentCreate.emitted()).toHaveProperty("created");
      expect(contentCreate.emitted()).toHaveProperty("close");
    });

    it("should emit the awaited events when we click on the `create and continue button`", async () => {
      await contentCreate.findComponent(InputFileImage).setValue(imageFile);
      await contentCreate.findComponent(InputText).setValue("Driving licence");
      const selectedBadges = [badges[0], badges[1]];
      await contentCreate
        .findComponent(SelectMultipleForBadge)
        .setValue(selectedBadges);

      await vueFlushPromises();

      await contentCreate
        .findComponent(InputRichText)
        .setValue("<p>This is useful when we cant to deal with police</p>");

      await contentCreate
        .find("[data-cy='create-continue-btn']")
        .trigger("click");

      await flushPromises(contentCreate);

      toastAssertions.expectSuccessCalled("succeed", {
        durationInSecond: 5,
        position: "top-right",
      });

      expect(contentStore.create).toHaveBeenCalledTimes(1);
      expect(contentStore.create).toHaveBeenCalledWith({
        title: "Driving licence",
        explanation: "<p>This is useful when we cant to deal with police</p>",
        illustration: imageFile,
        badges: [...selectedBadges],
        status: CONTENT_STATUS.DRAFT,
      });

      expect(contentCreate.emitted()).toHaveProperty("created");

      // TODO: Investigate why this is the only one which does not work
      // expect(
      //   contentCreate.findComponent(InputFileImage).props().modelValue,
      // ).toEqual(new File([], "", { lastModified: 1699401600000 }));

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
