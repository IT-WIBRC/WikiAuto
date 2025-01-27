import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { imageService } from "~/api/imageService";

const imagePath = "0.269874.jpg";
const mockUploadFile = vi.hoisted(() => ({
  upload: vi.fn(() => {
    return {
      error: null,
      data: {
        path: imagePath,
        fullPath: `/wikiAuto/${imagePath}`,
        id: "5465654164",
      },
    };
  }),
}));

vi.mock("~/api/supabaseInit", () => ({
  default: () => {
    return {
      storage: {
        from: () => mockUploadFile,
      },
    };
  },
}));

describe("Upload file", () => {
  beforeAll(() => {
    vi.setSystemTime(new Date("2023-10-08"));
  });

  afterAll(() => {
    vi.doUnmock("~/api/supabaseInit");
    vi.useRealTimers();
  });

  const imageFile = new File([""], "image.png", {
    type: "image/png",
    lastModified: 1696723200000,
  });

  it("should return an empty array when there is no content", async () => {
    const fileUpload = await imageService.uploadFile(imageFile, imagePath);
    expect(mockUploadFile.upload).toHaveBeenCalledTimes(1);
    expect(fileUpload).toEqual({
      error: null,
      data: {
        path: imagePath,
        fullPath: `/wikiAuto/${imagePath}`,
        id: "5465654164",
      },
    });
    expect(mockUploadFile.upload).toHaveBeenCalledWith(imagePath, imageFile, {
      upsert: true,
    });
    mockUploadFile.upload.mockRestore();
  });

  it("should return an error when the upload failed", async () => {
    mockUploadFile.upload.mockRestore();
    mockUploadFile.upload.mockImplementation(() => {
      return {
        error: {
          code: "InvalidToken",
          message: "Unknown key",
        },
        data: null,
      };
    });
    const fileUpload = await imageService.uploadFile(imageFile, imagePath);
    expect(mockUploadFile.upload).toHaveBeenCalledTimes(1);
    expect(fileUpload).toEqual({
      error: {
        code: "InvalidToken",
        message: "Unknown key",
      },
      data: null,
    });
    mockUploadFile.upload.mockRestore();
  });
});
