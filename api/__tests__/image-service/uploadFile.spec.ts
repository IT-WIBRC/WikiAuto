import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { imageService } from "~/api/imageService";

const imagePath = "0.269874.jpg";
const mockUpload = vi.fn(() => {
  return {
    error: null,
    data: {
      path: imagePath,
      fullPath: `/wikiAuto/${imagePath}`,
      id: "5465654164",
    },
  };
});

const mockFrom = vi.hoisted(() => ({
  from: vi.fn(() => {
    return {
      upload: mockUpload,
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

describe("Upload file", () => {
  beforeAll(() => {
    vi.setSystemTime(new Date("2023-10-08"));
  });

  afterAll(() => {
    vi.doUnmock("~/api/supabaseInit");
    vi.useRealTimers();
  });

  afterEach(() => {
    mockFrom.from.mockRestore();
    mockUpload.mockRestore();
  });

  const imageFile = new File([""], "image.png", {
    type: "image/png",
    lastModified: 1696723200000,
  });

  it("should return an empty array when there is no content", async () => {
    const fileUpload = await imageService.uploadFile(imageFile, imagePath);

    expect(mockFrom.from).toHaveBeenCalledTimes(1);
    expect(mockFrom.from).toHaveBeenCalledWith("wikiAuto_images");

    expect(mockUpload).toHaveBeenCalledTimes(1);
    expect(mockUpload).toHaveBeenCalledWith(imagePath, imageFile, {
      upsert: true,
    });

    expect(fileUpload).toEqual({
      error: null,
      data: {
        path: imagePath,
        fullPath: `/wikiAuto/${imagePath}`,
        id: "5465654164",
      },
    });
  });

  it("should return an error when the upload failed", async () => {
    mockUpload.mockImplementation(() => {
      return {
        error: {
          code: "InvalidToken",
          message: "Unknown key",
        },
        data: null,
      };
    });
    const fileUpload = await imageService.uploadFile(imageFile, imagePath);

    expect(mockUpload).toHaveBeenCalledTimes(1);
    expect(mockUpload).toHaveBeenCalledWith(imagePath, imageFile, {
      upsert: true,
    });

    expect(fileUpload).toEqual({
      error: {
        code: "InvalidToken",
        message: "Unknown key",
      },
      data: null,
    });
  });
});
