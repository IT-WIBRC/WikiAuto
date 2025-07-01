import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from "vitest";
import { flushPromises } from "@vue/test-utils";
import { setActivePinia, createPinia } from "pinia";

import { useContentStore } from "~/stores/content.store";
import { useAuthStore } from "~/stores/auth.store";
import {
  GenericErrors,
  contentService,
  type Badge,
  type ContentCreation,
  CONTENT_STATUS,
} from "~/api";
import { imageService } from "~/api/imageService";
import { StorageError } from "@supabase/storage-js";

describe("ContentStore create action", () => {
  let imageServiceSpy: MockInstance;
  let contentServiceCreateSpy: MockInstance;
  let mathRandomSpy: MockInstance;

  const getMockBadges = () =>
    [
      {
        name: "Vue",
        id: "vue-id",
      },
      {
        name: "TypeScript",
        id: "ts-id",
      },
    ] as unknown as Badge[];

  const createMockContentPayload = (
    illustrationFile: File,
    title: string = "My amazing title",
    explanation: string = "<p>My explanation</p>",
    status = CONTENT_STATUS.PENDING,
  ): ContentCreation => ({
    title,
    badges: getMockBadges(),
    explanation,
    illustration: illustrationFile,
    status,
  });

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.setSystemTime(new Date("2023-10-08T00:00:00.000Z"));

    imageServiceSpy = vi.spyOn(imageService, "uploadFile");
    contentServiceCreateSpy = vi.spyOn(contentService, "create");
    mathRandomSpy = vi.spyOn(Math, "random");

    const authStore = useAuthStore();
    authStore.session = {
      access_token: "mock-access-token",
      refresh_token: "mock-refresh-token",
      expires_in: 3600,
      token_type: "bearer",
      user: {
        email: "test@gmail.com",
        id: "user-id-123",
        app_metadata: {},
        user_metadata: {},
        aud: "",
        created_at: "",
      },
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it("should return success status on successful content creation", async () => {
    const mockImageName = 0.18201;
    mathRandomSpy.mockReturnValueOnce(mockImageName);

    imageServiceSpy.mockResolvedValueOnce({
      error: null,
      data: {
        path: `mock_path_${mockImageName}.png`,
        id: "mock_id_1",
        fullPath: `mock_path_${mockImageName}.png`,
      },
    });

    contentServiceCreateSpy.mockResolvedValueOnce({
      error: null,
      data: {
        content_id: "content-id-abc",
      },
      count: null,
      status: 201,
      statusText: "Created",
    });

    const illustrationFile = new File(["dummy content"], "image.png", {
      type: "image/png",
    });
    const contentPayload = createMockContentPayload(illustrationFile);

    const contentStore = useContentStore();
    const creationResponse = await contentStore.create(contentPayload);

    await flushPromises();

    expect(imageServiceSpy).toHaveBeenCalledTimes(1);
    expect(imageServiceSpy).toHaveBeenCalledWith(
      illustrationFile,
      `${mockImageName}.png`,
    );

    expect(contentServiceCreateSpy).toHaveBeenCalledTimes(1);
    expect(contentServiceCreateSpy).toHaveBeenCalledWith(
      {
        badges: getMockBadges(),
        explanation: "<p>My explanation</p>",
        illustration: `mock_path_${mockImageName}.png`,
        status: "PENDING",
        title: "My amazing title",
      },
      "test@gmail.com",
    );

    expect(creationResponse).toEqual({ status: "success" });
  });

  it("should return an error status when the image upload fails", async () => {
    const mockImageName = 0.2584;
    mathRandomSpy.mockReturnValueOnce(mockImageName);

    imageServiceSpy.mockResolvedValueOnce({
      error: new StorageError("upload failed"),
      data: null,
    });

    const illustrationFile = new File(["dummy content"], "image.png", {
      type: "image/png",
    });
    const contentPayload = createMockContentPayload(illustrationFile);

    const contentStore = useContentStore();
    const creationResponse = await contentStore.create(contentPayload);

    await flushPromises();

    expect(imageServiceSpy).toHaveBeenCalledTimes(1);
    expect(imageServiceSpy).toHaveBeenCalledWith(
      illustrationFile,
      `${mockImageName}.png`,
    );

    expect(contentServiceCreateSpy).not.toHaveBeenCalled();

    expect(creationResponse).toEqual({
      status: "error",
      message: GenericErrors.UPLOAD_FAILED_NO_PATH,
    });
  });

  it("should return an error status when content creation fails after successful upload", async () => {
    const mockImageName = 0.294815154;
    mathRandomSpy.mockReturnValueOnce(mockImageName);

    imageServiceSpy.mockResolvedValueOnce({
      error: null,
      data: {
        path: `mock_path_${mockImageName}.png`,
        id: "mock_id_2",
        fullPath: `mock_path_${mockImageName}.png`,
      },
    });

    contentServiceCreateSpy.mockResolvedValueOnce({
      error: {
        details: "Invalid request details",
        hint: "Check your payload",
        code: "PGRST100",
        name: "PostgrestError",
        message: "Payload malformed",
      },
      data: null,
      count: null,
      statusText: "Bad Request",
      status: 400,
    });

    const illustrationFile = new File(["dummy content"], "another-image.png", {
      type: "image/png",
    });
    const contentPayload = createMockContentPayload(illustrationFile);

    const contentStore = useContentStore();
    const creationResponse = await contentStore.create(contentPayload);

    await flushPromises();

    expect(imageServiceSpy).toHaveBeenCalledTimes(1);
    expect(imageServiceSpy).toHaveBeenCalledWith(
      illustrationFile,
      `${mockImageName}.png`,
    );

    expect(contentServiceCreateSpy).toHaveBeenCalledTimes(1);
    expect(contentServiceCreateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        illustration: `mock_path_${mockImageName}.png`,
      }),
      "test@gmail.com",
    );

    expect(creationResponse).toEqual({
      status: "error",
      message: GenericErrors.BAD_REQUEST,
    });
  });
});
