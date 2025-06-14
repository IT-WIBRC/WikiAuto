import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { flushPromises, type VueWrapper } from "@vue/test-utils";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import Dashboard from "../index.vue";
import CardDashboardTotalContent from "~/components/card/dashboard/TotalContent.vue";
import CardDashboardTotalValidatedContent from "~/components/card/dashboard/TotalValidatedContent.vue";
import CardDashboardTotalBadge from "~/components/card/dashboard/TotalBadge.vue";
import useUnitTestUtils from "~/utils/useUnitTestUtils";
import { useUserStore } from "~/stores/user.store";

describe("Dashboard", () => {
  let dashboard: VueWrapper;
  let pinia: ReturnType<typeof useUnitTestUtils.getPiniaInstance>;
  let userStore: ReturnType<typeof useUserStore>;

  beforeAll(async () => {
    pinia = useUnitTestUtils.getPiniaInstance({ stubActions: false });
    userStore = useUserStore(pinia);
    userStore.getProfile = vi.fn();

    userStore.hasAlreadyFetchUserProfile = true;
    dashboard = await mountSuspended(Dashboard, {
      shallow: true,
      global: {
        plugins: [pinia],
      },
    });
  });

  afterAll(() => {
    vi.resetModules();
  });

  it("shows the dashboard page when you visit", () => {
    expect(dashboard.exists()).toBe(true);
  });

  it("should not get the profile if it has already been done", () => {
    expect(userStore.getProfile).not.toHaveBeenCalled();
    expect(userStore.hasAlreadyFetchUserProfile).toBe(true);
  });

  it("greets you with the dashboard title", () => {
    expect(dashboard.find("[data-cy='dashboard-title']").text()).toBe("ttl");
  });

  it("shows a card with the total content in the system", () => {
    expect(dashboard.findComponent(CardDashboardTotalContent).exists()).toBe(
      true,
    );
  });

  it("shows a card with the total validated content in the system", () => {
    expect(
      dashboard.findComponent(CardDashboardTotalValidatedContent).exists(),
    ).toBe(true);
  });

  it("shows a card with the total badge count in the system", () => {
    expect(dashboard.findComponent(CardDashboardTotalBadge).exists()).toBe(
      true,
    );
  });

  it("shows an error toast if fetching the user profile fails", async () => {
    userStore.hasAlreadyFetchUserProfile = false;
    userStore.getProfile = vi.fn().mockResolvedValueOnce({
      status: "error",
      message: "SERVER_ERROR",
    });
    const toastError = useUnitTestUtils.spyOnToastFn("error");
    await mountSuspended(Dashboard, {
      shallow: true,
      global: {
        plugins: [pinia],
      },
    });
    await flushPromises();

    expect(toastError).toHaveBeenCalledWith("generic_errors.SERVER_ERROR");
  });
});
