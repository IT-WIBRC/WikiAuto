import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import type { VueWrapper } from "@vue/test-utils";
import AuthPage from "../index.vue";
import InputEmail from "~/components/input/email.vue";
import InputPassword from "~/components/input/password.vue";
import AlertError from "~/components/alert/error.vue";
import { createTestingPinia } from "@pinia/testing";
import { useAuthStore } from "~/stores/auth.store";
import { useUserStore } from "../../../stores/user.store";

describe("AuthPage", () => {
  mockNuxtImport("useI18n", () => {
    return () => ({
      t: vi.fn((msg: string) => msg),
    });
  });

  let authPage: VueWrapper;
  beforeAll(async () => {
    authPage = await mountSuspended(AuthPage, {
      shallow: true,
    });
  });

  afterAll(() => {
    vi.resetModules();
  });

  it("should render correctly", () => {
    expect(authPage.exists()).toBe(true);
  });

  it("should display the login title", () => {
    expect(authPage.find("[data-cy='login-title']").text()).toBe("_ttl");
  });

  it("should display the login description", () => {
    expect(authPage.find("[data-cy='login-description']").text()).toBe("_desc");
  });

  it("should render the email input", () => {
    const emailInput = authPage.findComponent(InputEmail);
    expect(emailInput.exists()).toBe(true);
    expect(emailInput.props()).toEqual({
      placeholder: "email._ph",
      label: "email._lbl",
      hasError: false,
      isRequired: true,
      modelValue: "",
    });
  });

  it("should render the password input", () => {
    const passwordInput = authPage.findComponent(InputPassword);
    expect(passwordInput.exists()).toBe(true);
    expect(passwordInput.props()).toEqual({
      placeholder: "password._ph",
      label: "password._lbl",
      hasError: false,
      isRequired: true,
      modelValue: "",
    });
  });

  it("should render the login button", () => {
    const loginButton = authPage.find("[data-cy='login-submit']");
    expect(loginButton.exists()).toBe(true);
    expect(loginButton.element.disabled).toBe(false);
    expect(loginButton.text()).toBe("login_btn");
  });

  it("should display the message error on the form when received", async () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: true,
    });
    const authStore = useAuthStore(pinia);
    authStore.login = vi.fn();
    authStore.login = vi.fn().mockResolvedValueOnce({
      status: "error",
      message: "BAD_REQUEST",
    });

    authPage = await mountSuspended(AuthPage, {
      shallow: true,
      global: {
        plugins: [pinia],
      },
    });
    await authPage.findComponent(InputEmail).setValue("test@gmail.com");
    await authPage.findComponent(InputEmail).setValue("test@gmailcom");

    let alertMessage = authPage.findComponent(AlertError);
    expect(alertMessage.exists()).toBe(false);

    await authPage.find("[data-cy='login-submit']").trigger("submit");

    alertMessage = authPage.findComponent(AlertError);
    expect(alertMessage.exists()).toBe(true);
    expect(alertMessage.props().message).toBe("generic_errors.BAD_REQUEST");
    vi.resetAllMocks();
  });

  it("should navigate to the '/dashboard' page when the login succeeded", async () => {
    const piniaCustom = createTestingPinia({
      createSpy: vi.fn(),
      stubActions: true,
    });
    const authStore = useAuthStore(piniaCustom);
    authStore.login = vi.fn();
    const userStore = useUserStore(piniaCustom);
    const userData = {
      id: "b4ebcf93-7b09-4ee1-bbb3-0a67c1cb1748",
      app_metadata: {},
      user_metadata: {},
      aud: "fb2e796d-69f7-451a-8434-2307d1436d48",
    };
    authStore.login = vi.fn().mockResolvedValueOnce({
      status: "success",
      data: userData,
    });

    const authPageCustom = await mountSuspended(AuthPage, {
      shallow: true,
      global: {
        plugins: [piniaCustom],
      },
    });
    await authPageCustom.findComponent(InputEmail).setValue("test@gmail.com");
    await authPageCustom.findComponent(InputEmail).setValue("test@gmailcom");

    let alertMessage = authPageCustom.findComponent(AlertError);
    expect(alertMessage.exists()).toBe(false);

    await authPageCustom.find("[data-cy='login-submit']").trigger("submit");

    alertMessage = authPageCustom.findComponent(AlertError);
    expect(alertMessage.exists()).toBe(false);

    expect(userStore.currentUser).toEqual(userData);

    vi.resetAllMocks();
  });
});
