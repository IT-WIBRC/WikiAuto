import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import authMiddleware from "~/middleware/auth";

const { mockUseClientUser, mockNavigateTo } = vi.hoisted(() => {
  return {
    mockUseClientUser: vi.fn(),
    mockNavigateTo: vi.fn(),
  };
});

mockNuxtImport("navigateTo", () => mockNavigateTo);

vi.mock("~/shared/utils/api-client", () => {
  return {
    useClientUser: mockUseClientUser,
  };
});

describe("Client Middleware: auth.ts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not redirect if the user is authenticated", () => {
    mockUseClientUser.mockReturnValue(ref({ id: "user-123" }));

    const result = authMiddleware();

    expect(mockUseClientUser).toHaveBeenCalled();
    expect(result).toBeUndefined();
    expect(mockNavigateTo).not.toHaveBeenCalled();
  });

  it("should redirect to '/auth' if the user is not authenticated", () => {
    mockUseClientUser.mockReturnValue(ref(null));

    const result = authMiddleware();

    expect(mockUseClientUser).toHaveBeenCalled();
    expect(mockNavigateTo).toHaveBeenCalledWith("/auth");
    expect(result).toEqual(mockNavigateTo("/auth"));
  });
});
