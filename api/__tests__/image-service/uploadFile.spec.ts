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
const mockUpload = vi.fn();
const mockFrom = vi.hoisted(() => ({
  from: vi.fn(() => ({
    upload: mockUpload,
  })),
}));

vi.mock("~/api/utils/supabaseInit", () => ({
  default: () => ({
    storage: mockFrom,
  }),
}));

describe("Upload file", () => {
  beforeAll(() => {
    vi.setSystemTime(new Date("2023-10-08"));
  });

  afterAll(() => {
    vi.doUnmock("~/api/utils/supabaseInit");
    vi.useRealTimers();
  });

  afterEach(() => {
    mockFrom.from.mockClear();
    mockUpload.mockClear();
  });

  const imageFile = new File([""], "image.png", {
    type: "image/png",
    lastModified: 1696723200000,
  });

  it("should return upload result on success", async () => {
    mockUpload.mockReturnValueOnce({
      error: null,
      data: {
        path: imagePath,
        fullPath: `/wikiAuto/${imagePath}`,
        id: "5465654164",
      },
    });

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
    mockUpload.mockReturnValueOnce({
      error: {
        code: "InvalidToken",
        message: "Unknown key",
      },
      data: null,
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
