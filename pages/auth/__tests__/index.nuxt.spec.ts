import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises, type VueWrapper } from "@vue/test-utils";
import AuthPage from "../index.vue";
import InputEmail from "~/components/input/email.vue";
import InputPassword from "~/components/input/password.vue";
import AlertError from "~/components/alert/error.vue";
import { useAuthStore } from "~/stores/auth.store";
import { useUserStore } from "~/stores/user.store";
import useUnitTestUtils from "~/utils/useUnitTestUtils";
import { GenericErrors } from "~/api";

describe("AuthPage", () => {
  const { mockNavigateTo } = vi.hoisted(() => ({
    mockNavigateTo: vi.fn(),
  }));

  mockNuxtImport("navigateTo", () => mockNavigateTo);

  let authPage: VueWrapper;
  let pinia: ReturnType<typeof useUnitTestUtils.getPiniaInstance>;

  beforeAll(async () => {
    pinia = useUnitTestUtils.getPiniaInstance({ stubActions: false });
    authPage = await mountSuspended(AuthPage, {
      shallow: true,
      global: {
        plugins: [pinia],
      },
    });
  });

  afterAll(() => {
    vi.resetModules();
  });

  it("shows the login page when you visit", () => {
    expect(authPage.exists()).toBe(true);
  });

  it("greets you with a login title", () => {
    expect(authPage.find("[data-cy='login-title']").text()).toBe("_ttl");
  });

  it("shows a short description under the title", () => {
    expect(authPage.find("[data-cy='login-description']").text()).toBe("_desc");
  });

  it("shows an email input so you can type your email", () => {
    const emailInput = authPage.findComponent(InputEmail);
    expect(emailInput.exists()).toBe(true);
    expect(emailInput.props()).toEqual({
      placeholder: "email._ph",
      label: "email._lbl",
      hasError: false,
      isRequired: true,
      modelValue: "",
      isDisabled: false,
    });
  });

  it("shows a password input so you can type your password", () => {
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

  it("shows a login button so you can sign in", () => {
    const loginButton = authPage.find<HTMLButtonElement>(
      "[data-cy='login-submit']",
    );
    expect(loginButton.exists()).toBe(true);
    expect(loginButton.element.disabled).toBe(false);
    expect(loginButton.text()).toBe("login_btn");
  });

  it("shows an error message if you enter the wrong email or password", async () => {
    const pinia = useUnitTestUtils.getPiniaInstance({ stubActions: false });
    const authStore = useAuthStore(pinia);
    authStore.login = vi.fn().mockResolvedValueOnce({
      status: "error",
      message: GenericErrors.BAD_REQUEST,
    });

    const authPageLocal = await mountSuspended(AuthPage, {
      shallow: true,
      global: {
        plugins: [pinia],
      },
    });

    await authPageLocal.findComponent(InputEmail).setValue("test@gmail.com");
    await authPageLocal.findComponent(InputPassword).setValue("wrongpassword");

    let alertMessage = authPageLocal.findComponent(AlertError);
    expect(alertMessage.exists()).toBe(false);

    await authPageLocal.find("[data-cy='login-submit']").trigger("submit");
    await flushPromises();

    alertMessage = authPageLocal.findComponent(AlertError);
    expect(alertMessage.exists()).toBe(true);
    expect(alertMessage.props().message).toBe("generic_errors.BAD_REQUEST");
    vi.resetAllMocks();
  });

  it("shows a generic error message if something unexpected happens while logging in", async () => {
    const pinia = useUnitTestUtils.getPiniaInstance({ stubActions: false });
    const authStore = useAuthStore(pinia);
    authStore.login = vi.fn().mockResolvedValueOnce({
      status: "error",
      message: GenericErrors.UNKNOWN_ERROR,
    });

    const authPageLocal = await mountSuspended(AuthPage, {
      shallow: true,
      global: {
        plugins: [pinia],
      },
    });

    await authPageLocal.findComponent(InputEmail).setValue("test@gmail.com");
    await authPageLocal.findComponent(InputPassword).setValue("any");
    let alertMessage = authPageLocal.findComponent(AlertError);
    expect(alertMessage.exists()).toBe(false);

    await authPageLocal.find("[data-cy='login-submit']").trigger("submit");
    await flushPromises();

    alertMessage = authPageLocal.findComponent(AlertError);
    expect(alertMessage.exists()).toBe(true);
    expect(alertMessage.props().message).toBe("generic_errors.UNKNOWN_ERROR");
    vi.resetAllMocks();
  });

  it("takes you to your dashboard when you log in with the right credentials", async () => {
    const pinia = useUnitTestUtils.getPiniaInstance({ stubActions: false });
    const authStore = useAuthStore(pinia);
    const userStore = useUserStore(pinia);
    const userData = {
      id: "b4ebcf93-7b09-4ee1-bbb3-0a67c1cb1748",
      email: "test@gmail.com",
      app_metadata: {},
      user_metadata: {},
      aud: "fb2e796d-69f7-451a-8434-2307d1436d48",
    };

    authStore.login = vi.fn().mockResolvedValueOnce({
      status: "success",
      data: userData,
    });

    const setCurrentUserIdAndEmailSpy = vi.spyOn(
      userStore,
      "setCurrentUserIdAndEmail",
    );

    const authPageLocal = await mountSuspended(AuthPage, {
      shallow: true,
      global: {
        plugins: [pinia],
      },
    });

    await authPageLocal.findComponent(InputEmail).setValue("test@gmail.com");
    await authPageLocal
      .findComponent(InputPassword)
      .setValue("correctpassword");

    let alertMessage = authPageLocal.findComponent(AlertError);
    expect(alertMessage.exists()).toBe(false);

    await authPageLocal.find("[data-cy='login-submit']").trigger("submit");
    await flushPromises();

    alertMessage = authPageLocal.findComponent(AlertError);
    expect(alertMessage.exists()).toBe(false);

    expect(setCurrentUserIdAndEmailSpy).toHaveBeenCalledWith(
      userData.id,
      userData.email,
    );
    expect(userStore.currentUser.id).toBe(userData.id);
    expect(userStore.currentUser.email).toBe(userData.email);

    expect(mockNavigateTo).toHaveBeenCalledTimes(1);
    expect(mockNavigateTo).toHaveBeenCalledWith("/dashboard");

    vi.resetAllMocks();
  });
});
