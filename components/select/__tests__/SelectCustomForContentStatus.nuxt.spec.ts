import { beforeAll, describe, expect, it } from "vitest";
import type { VueWrapper } from "@vue/test-utils";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { SelectCustomForContentStatus } from "#components";
import { CONTENT_STATUS } from "~/api";

describe("CustomForContentStatus", () => {
  let selectCustomForContentStatus: VueWrapper;

  beforeAll(async () => {
    selectCustomForContentStatus = await mountSuspended(
      SelectCustomForContentStatus,
      {
        props: {
          label: "Status",
          isRequired: false,
          modelValue: "DRAFT",
        },
      },
    );
  });

  it("should render correctly", () => {
    expect(selectCustomForContentStatus.exists()).toBe(true);
  });

  it("should render the awaited label when the props `isRequired = False`", () => {
    expect(selectCustomForContentStatus.find("label").text()).toBe("Status");
  });

  it("should render the awaited label when the props `isRequired = True`", async () => {
    const selectCustomForContentStatus = await mountSuspended(
      SelectCustomForContentStatus,
      {
        props: {
          label: "Status",
          isRequired: true,
          modelValue: "DRAFT",
        },
      },
    );
    expect(selectCustomForContentStatus.find("label").text()).toBe("Status *");
  });

  it("should display the error message when exists", async () => {
    let errorMessage = selectCustomForContentStatus.find("[data-cy='error']");
    expect(errorMessage.exists()).toBe(false);

    const selectCustomForStatus2 = await mountSuspended(
      SelectCustomForContentStatus,
      {
        props: {
          label: "Status",
          isRequired: true,
          modelValue: "DRAFT",
          errorMessage: "Wrong status selected",
        },
      },
    );
    errorMessage = selectCustomForStatus2.find("[data-cy='error']");
    expect(errorMessage.text()).toBe("Wrong status selected");
  });

  it("should display the awaited status with awaited style", () => {
    const statusList =
      selectCustomForContentStatus.findAll("[data-cy='status']");
    expect(statusList.length).toBe(3);
    const statusGroup = Object.values(CONTENT_STATUS);
    statusList.forEach((status) => {
      expect(statusGroup.includes(status.text())).toBe(true);
      expect(status.attributes().class).toContain(status.text().toLowerCase());
    });
  });

  it("should display the awaited style on the proper status when selected", async () => {
    const draftStatus = selectCustomForContentStatus.find(
      "[data-cy-id='draft']",
    );
    expect(draftStatus.exists()).toBe(true);
    expect(draftStatus.text()).toBe("DRAFT");
    expect(draftStatus.attributes().class).toContain("draft-selected");

    let validatedStatus = selectCustomForContentStatus.find(
      "[data-cy-id='validated']",
    );
    expect(validatedStatus.exists()).toBe(true);
    expect(validatedStatus.text()).toBe("VALIDATED");

    await validatedStatus.trigger("click");
    validatedStatus = selectCustomForContentStatus.find(
      "[data-cy-id='validated']",
    );
    expect(validatedStatus.attributes().class).toContain("validated-selected");

    let pendingStatus = selectCustomForContentStatus.find(
      "[data-cy-id='pending']",
    );
    expect(pendingStatus.exists()).toBe(true);
    expect(pendingStatus.text()).toBe("PENDING");

    await pendingStatus.trigger("click");
    pendingStatus = selectCustomForContentStatus.find("[data-cy-id='pending']");
    expect(pendingStatus.attributes().class).toContain("pending-selected");
  });

  it("should emit the awaited status on click", async () => {
    const selectCustomForContentStatus = await mountSuspended(
      SelectCustomForContentStatus,
      {
        props: {
          label: "Status",
          isRequired: true,
          modelValue: "DRAFT",
        },
      },
    );
    await selectCustomForContentStatus
      .find("[data-cy-id='pending']")
      .trigger("click");
    expect(selectCustomForContentStatus.emitted()).toHaveProperty(
      "update:modelValue",
      [["PENDING"]],
    );
  });
});
