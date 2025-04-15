import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { VueWrapper } from "@vue/test-utils";
import { IconClose, ModalLayout } from "#components";
import { mountSuspended } from "@nuxt/test-utils/runtime";

describe("ModalLayout", () => {
  let modalLayout: VueWrapper;
  beforeAll(async () => {
    modalLayout = await mountSuspended(ModalLayout, {
      slots: {
        header: () => "<h3>Header</h3>",
        body: () => "<div>Body</div>",
        footer: () => "<p>Footer</p>",
      },
    });
  });

  afterAll(() => {
    document.body.innerHTML = "";
  });

  it("should render correctly", () => {
    expect(modalLayout.exists()).toBe(true);
  });

  it("should contain the icon to close the modal", () => {
    expect(modalLayout.findComponent(IconClose).exists()).toBe(true);
  });

  it("should close the modal when we click on the close modal button", async () => {
    await modalLayout.findComponent(IconClose).trigger("click");
    expect(modalLayout.emitted()).toHaveProperty("closed");
  });

  it("should contain the awaited header", () => {
    const modalHeader = modalLayout.find("[data-test='modal-header']");
    expect(modalHeader.exists()).toBe(true);
    expect(modalHeader.text()).toContain("Header");
  });

  it("should contain the awaited body", () => {
    const modalBody = modalLayout.find("[data-test='modal-body']");
    expect(modalBody.exists()).toBe(true);
    expect(modalBody.text()).toContain("Body");
  });

  it("should contain the awaited footer", () => {
    const modalFooter = modalLayout.find("[data-test='modal-footer']");
    expect(modalFooter.exists()).toBe(true);
    expect(modalFooter.text()).toContain("Footer");
  });

  it("should not display the footer if not provide", async () => {
    const modalLayout = await mountSuspended(ModalLayout, {
      slots: {
        header: () => "<h3>Header</h3>",
        body: () => "<div>Body</div>",
      },
    });
    expect(modalLayout.find("[data-test='modal-footer']").exists()).toBe(false);
  });

  it("should not display the header if not provide", async () => {
    const modalLayout = await mountSuspended(ModalLayout, {
      slots: {
        body: () => "<div>Body</div>",
      },
    });
    expect(modalLayout.find("[data-test='modal-header']").exists()).toBe(false);
  });

  it("should not display the body if not provide", async () => {
    const modalLayout = await mountSuspended(ModalLayout, {
      slots: {
        header: () => "<h3>Header</h3>",
        footer: () => "<p>Footer</p>",
      },
    });
    expect(modalLayout.find("[data-test='modal-body']").exists()).toBe(false);
  });
});
