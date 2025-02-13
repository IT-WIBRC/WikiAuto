import { afterAll, describe, expect, it, vi } from "vitest";
import { imageService } from "~/api/imageService";

const imagePath = "http://localhost/wikiAuto/0.269874.jpg";
const mockGetPublicUrlFile = vi.hoisted(() => ({
  getPublicUrl: vi.fn(() => {
    return {
      error: null,
      data: {
        publicUrl: imagePath,
      },
    };
  }),
}));

vi.mock("~/api/supabaseInit", () => ({
  default: () => {
    return {
      storage: {
        from: () => mockGetPublicUrlFile,
      },
    };
  },
}));

describe("Get public url file", () => {
  afterAll(() => {
    vi.doUnmock("~/api/supabaseInit");
  });

  it("should return the public URL from image path", async () => {
    const fileUpload = await imageService.getPublicUrlFrom("0.269874.jpg");
    expect(mockGetPublicUrlFile.getPublicUrl).toHaveBeenCalledTimes(1);
    expect(fileUpload).toEqual({
      error: null,
      data: {
        publicUrl: imagePath,
      },
    });
    expect(mockGetPublicUrlFile.getPublicUrl).toHaveBeenCalledWith(
      "0.269874.jpg",
    );
    mockGetPublicUrlFile.getPublicUrl.mockRestore();
  });

  it("should return an error when the image is not recognize", async () => {
    mockGetPublicUrlFile.getPublicUrl.mockRestore();
    mockGetPublicUrlFile.getPublicUrl.mockImplementation(() => {
      return {
        error: {
          code: "InvalidToken",
          message: "Unknown key",
        },
        data: null,
      };
    });
    const fileUpload = await imageService.getPublicUrlFrom("0.269874.jpg");
    expect(mockGetPublicUrlFile.getPublicUrl).toHaveBeenCalledTimes(1);
    expect(fileUpload).toEqual({
      error: {
        code: "InvalidToken",
        message: "Unknown key",
      },
      data: null,
    });
    mockGetPublicUrlFile.getPublicUrl.mockRestore();
  });
});
