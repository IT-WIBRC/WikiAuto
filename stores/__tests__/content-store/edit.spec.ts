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
import { setActivePinia, createPinia } from "pinia";
import { useContentStore } from "~/stores/content.store";
import {
  contentService,
  imageService,
  CONTENT_STATUS,
  GenericErrors,
  type ContentEdition,
  type Badge,
} from "~/api";
import { flushPromises } from "@vue/test-utils";
import { StorageError } from "@supabase/storage-js";

describe("ContentStore", () => {
  let imageServiceSpy: MockInstance;
  let contentServiceEditSpy: MockInstance;
  let mathRandomSpy: MockInstance;

  const getMockBadges = () =>
    [
      {
        badge_id: "123456789",
        name: "signalisation",
      },
      {
        badge_id: "324456987",
        name: "pneus",
      },
    ] as unknown as Badge[];

  const editMockContentPayload = (
    illustrationFile: File,
    id = "12345645",
    userEmail = "test@email.com",
    title: string = "My amazing title",
    explanation: string = "<p>My explanation</p>",
    status = CONTENT_STATUS.PENDING,
  ): ContentEdition => ({
    id,
    userEmail,
    title,
    badges: getMockBadges(),
    explanation,
    illustration: illustrationFile,
    status,
  });

  beforeEach(() => {
    vi.setSystemTime(new Date(2023, 10, 8, 0, 0, 0));
    setActivePinia(createPinia());

    imageServiceSpy = vi.spyOn(imageService, "uploadFile");
    contentServiceEditSpy = vi.spyOn(contentService, "edit");
    mathRandomSpy = vi.spyOn(Math, "random");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  describe("Edit", () => {
    it("should return the awaited status on successful content edition", async () => {
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

      contentServiceEditSpy.mockResolvedValueOnce({
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
      const contentPayload = editMockContentPayload(illustrationFile);

      const contentStore = useContentStore();
      const editionResponse = await contentStore.edit(contentPayload);

      await flushPromises();

      expect(imageServiceSpy).toHaveBeenCalledTimes(1);
      expect(imageServiceSpy).toHaveBeenCalledWith(
        illustrationFile,
        `${mockImageName}.png`,
      );

      expect(contentServiceEditSpy).toHaveBeenCalledTimes(1);
      expect(contentServiceEditSpy).toHaveBeenCalledWith({
        id: "12345645",
        userEmail: "test@email.com",
        badges: getMockBadges(),
        explanation: "<p>My explanation</p>",
        illustration: `mock_path_${mockImageName}.png`,
        status: "PENDING",
        title: "My amazing title",
      });

      expect(editionResponse).toEqual({ status: "success" });
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
      const contentPayload = editMockContentPayload(illustrationFile);

      const contentStore = useContentStore();
      const editionResponse = await contentStore.edit(contentPayload);

      await flushPromises();

      expect(imageServiceSpy).toHaveBeenCalledTimes(1);
      expect(imageServiceSpy).toHaveBeenCalledWith(
        illustrationFile,
        `${mockImageName}.png`,
      );

      expect(contentServiceEditSpy).not.toHaveBeenCalled();

      expect(editionResponse).toEqual({
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

      contentServiceEditSpy.mockResolvedValueOnce({
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

      const illustrationFile = new File(
        ["dummy content"],
        "another-image.png",
        {
          type: "image/png",
        },
      );
      const contentPayload = editMockContentPayload(illustrationFile);

      const contentStore = useContentStore();
      const creationResponse = await contentStore.edit(contentPayload);

      await flushPromises();

      expect(imageServiceSpy).toHaveBeenCalledTimes(1);
      expect(imageServiceSpy).toHaveBeenCalledWith(
        illustrationFile,
        `${mockImageName}.png`,
      );

      expect(contentServiceEditSpy).toHaveBeenCalledTimes(1);
      expect(contentServiceEditSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          illustration: `mock_path_${mockImageName}.png`,
          userEmail: "test@email.com",
        }),
      );

      expect(creationResponse).toEqual({
        status: "error",
        message: GenericErrors.BAD_REQUEST,
      });
    });
  });
});
