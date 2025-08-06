import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { flushPromises, type VueWrapper } from "@vue/test-utils";
import {
  ModalLayout,
  ModalStatusUpdate,
  SelectCustomForContentStatus,
} from "#components";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { CONTENT_STATUS } from "~/api";
import testUtils from "~/tests/utils/ui";
import { getMockUseToastInstance } from "~/tests/mocks/mockUseToast";

const { getPiniaInstance, toastAssertions } = testUtils;
const mockUseToast = getMockUseToastInstance();

vi.mock("~/composables/useToast", () => ({
  useToast: vi.fn(() => mockUseToast),
}));

describe("ModalStatusUpdate", () => {
  let modalStatusUpdate: VueWrapper;

  const pinia = getPiniaInstance({ stubActions: true });

  const contentStore = useContentStore(pinia);
  contentStore.editStatus = vi.fn().mockReturnValue({
    status: "success",
  });
  beforeAll(async () => {
    modalStatusUpdate = await mountSuspended(ModalStatusUpdate, {
      props: {
        contentId: "135246546",
        currentStatus: CONTENT_STATUS.PENDING,
      },
    });
  });

  beforeEach(() => {
    mockUseToast.reset();
  });

  afterAll(() => {
    document.body.innerHTML = "";
  });

  it("should render correctly", () => {
    expect(modalStatusUpdate.exists()).toBe(true);
  });

  it("should render the modal layout component", () => {
    expect(modalStatusUpdate.findComponent(ModalLayout).exists()).toBe(true);
  });

  it("should display the awaited title", () => {
    expect(modalStatusUpdate.find("[data-cy='title']").text()).toBe(
      "title_lbl",
    );
  });

  it("should render the update button and disabled by default", () => {
    const updateBtn = modalStatusUpdate.find("[data-cy='update-btn']");
    expect(updateBtn.exists()).toBe(true);
    expect(updateBtn.text()).toBe("btn.update");
    expect(updateBtn.element.disabled).toBe(true);
  });

  it("should render the cancel button", () => {
    const cancelBtn = modalStatusUpdate.find("[data-cy='cancel-btn']");
    expect(cancelBtn.exists()).toBe(true);
    expect(cancelBtn.text()).toBe("btn.cancel");
  });

  it("should close the modal when we click on the cancel button", async () => {
    await modalStatusUpdate.find("[data-cy='cancel-btn']").trigger("click");
    expect(modalStatusUpdate.emitted()).toHaveProperty("close");
  });

  it("should render the component to choose the status with default value", () => {
    const statusField = modalStatusUpdate.findComponent(
      SelectCustomForContentStatus,
    );
    expect(statusField.exists()).toBe(true);
    expect(statusField.props()).toEqual({
      label: "status_lbl",
      modelValue: CONTENT_STATUS.PENDING,
      isRequired: true,
    });
  });

  it("should toast a success message when the update succeed", async () => {
    let updateBtn = modalStatusUpdate.find("[data-cy='update-btn']");
    expect(updateBtn.element.disabled).toBe(true);

    await modalStatusUpdate
      .findComponent(SelectCustomForContentStatus)
      .setValue(CONTENT_STATUS.DRAFT);

    updateBtn = modalStatusUpdate.find("[data-cy='update-btn']");
    expect(updateBtn.element.disabled).toBe(false);

    await updateBtn.trigger("click");

    await flushPromises();

    expect(contentStore.editStatus).toHaveBeenCalledTimes(1);
    expect(contentStore.editStatus).toHaveBeenCalledWith(
      CONTENT_STATUS.DRAFT,
      "135246546",
    );

    toastAssertions.expectSuccessCalled("response.success");
    expect(modalStatusUpdate.emitted()).toHaveProperty("updated");
  });

  it("should toast am error message when the update failed to proceed", async () => {
    contentStore.editStatus = vi.fn().mockReturnValue({
      status: "error",
    });

    modalStatusUpdate = await mountSuspended(ModalStatusUpdate, {
      props: {
        contentId: "135246546",
        currentStatus: CONTENT_STATUS.PENDING,
      },
    });

    let updateBtn = modalStatusUpdate.find("[data-cy='update-btn']");
    expect(updateBtn.element.disabled).toBe(true);

    await modalStatusUpdate
      .findComponent(SelectCustomForContentStatus)
      .setValue(CONTENT_STATUS.DRAFT);

    updateBtn = modalStatusUpdate.find("[data-cy='update-btn']");
    expect(updateBtn.element.disabled).toBe(false);

    await updateBtn.trigger("click");

    await flushPromises();

    expect(contentStore.editStatus).toHaveBeenCalledTimes(1);
    expect(contentStore.editStatus).toHaveBeenCalledWith(
      CONTENT_STATUS.DRAFT,
      "135246546",
    );

    toastAssertions.expectErrorCalled("response.failure");
  });
});
