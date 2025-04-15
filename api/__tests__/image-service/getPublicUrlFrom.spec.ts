import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import { imageService } from "~/api/imageService";

const imagePath = "http://localhost/wikiAuto/0.269874.jpg";
const mockGetPublicUrl = vi.fn(() => {
  return {
    error: null,
    data: {
      publicUrl: imagePath,
    },
  };
});

const mockFrom = vi.hoisted(() => ({
  from: vi.fn(() => {
    return {
      getPublicUrl: mockGetPublicUrl,
    };
  }),
}));

vi.mock("~/api/supabaseInit", () => ({
  default: () => {
    return {
      storage: mockFrom,
    };
  },
}));

describe("Get public url file", () => {
  afterAll(() => {
    vi.doUnmock("~/api/supabaseInit");
  });

  afterEach(() => {
    mockFrom.from.mockRestore();
    mockGetPublicUrl.mockRestore();
  });

  it("should return the public URL from image path", async () => {
    const fileUpload = await imageService.getPublicUrlFrom("0.269874.jpg");

    expect(mockFrom.from).toHaveBeenCalledTimes(1);
    expect(mockFrom.from).toHaveBeenCalledWith("wikiAuto_images");

    expect(mockGetPublicUrl).toHaveBeenCalledTimes(1);
    expect(mockGetPublicUrl).toHaveBeenCalledWith("0.269874.jpg");

    expect(fileUpload).toEqual({
      error: null,
      data: {
        publicUrl: imagePath,
      },
    });
  });

  it("should return an error when the image is not recognize", async () => {
    mockGetPublicUrl.mockImplementation(() => {
      return {
        error: {
          code: "InvalidToken",
          message: "Unknown key",
        },
        data: null,
      };
    });
    const fileUpload = await imageService.getPublicUrlFrom("0.269874.jpg");

    expect(mockGetPublicUrl).toHaveBeenCalledTimes(1);
    expect(mockGetPublicUrl).toHaveBeenCalledWith("0.269874.jpg");

    expect(fileUpload).toEqual({
      error: {
        code: "InvalidToken",
        message: "Unknown key",
      },
      data: null,
    });
  });
});
