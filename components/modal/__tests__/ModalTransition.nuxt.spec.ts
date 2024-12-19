import { beforeAll, describe, expect, it } from "vitest";
import { ModalTransition } from "#components";
import type { VueWrapper } from "@vue/test-utils";
import { mountSuspended } from "@nuxt/test-utils/runtime";

describe("ModalTransition", () => {
  let modalTransition: VueWrapper;
  beforeAll(async () => {
    modalTransition = await mountSuspended(ModalTransition);
  });

  it("should render correctly", () => {
    expect(modalTransition.exists()).toBe(true);
  });

  it("should not render the modal content when the props `show = False`", () => {
    expect(
      modalTransition.find("[data-test='modal-container-transition']").exists(),
    ).toBe(false);
  });

  it("should have the default transition name", () => {
    const transition = modalTransition.findComponent("transition-stub");
    expect(transition.exists()).toBe(true);
    expect(transition.attributes().name).toBe("modal");
  });

  it("should render the modal content when the props `show  =True`", async () => {
    const modalTransition = await mountSuspended(ModalTransition, {
      props: {
        show: true,
      },
    });
    expect(
      modalTransition.find("[data-test='modal-container-transition']").exists(),
    ).toBe(true);
  });

  it("should have transition name when it is set", async () => {
    const modalTransition = await mountSuspended(ModalTransition, {
      props: {
        transitionName: "slide",
      },
    });
    expect(
      modalTransition.findComponent("transition-stub").attributes().name,
    ).toBe("slide");
  });
});
