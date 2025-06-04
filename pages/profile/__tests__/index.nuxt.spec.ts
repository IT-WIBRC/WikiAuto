import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import type { VueWrapper } from "@vue/test-utils";
import SectionProfile from "~/components/section/Profile.vue";
import ProfilePage from "../index.vue";

describe("ProfilePage", () => {
  let profilePageWrapper: VueWrapper;

  beforeAll(async () => {
    profilePageWrapper = await mountSuspended(ProfilePage, {
      shallow: true,
      global: {
        stubs: {
          SectionProfile,
        },
      },
    });
  });

  afterAll(() => {
    vi.resetModules();
  });

  it("should render correctly", () => {
    expect(profilePageWrapper.exists()).toBe(true);
  });

  it("should display the user profile title using i18n key", () => {
    const title = profilePageWrapper.find("[data-cy='user-profile-title']");
    expect(title.exists()).toBe(true);
    expect(title.text()).toBe("ttl");
  });

  it("should render the SectionProfile component", () => {
    const section = profilePageWrapper.find("[data-cy='profile-section']");
    expect(section.exists()).toBe(true);
  });
});
