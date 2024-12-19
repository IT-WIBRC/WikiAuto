import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useContentStore } from "../../content.store";
import { contentService } from "../../../api/contentService";
import { imageService } from "../../../api/imageService";
import { useAuthStore } from "../../auth.store";
import { GenericErrors } from "../../../api/types";

describe("ContentStore", () => {
  beforeEach(() => {
    vi.setSystemTime(new Date("2023-10-08"));
    setActivePinia(createPinia());
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const badges = [
    {
      badge_id: "123456789",
      name: "signalisation",
    },
    {
      badge_id: "324456987",
      name: "pneus",
    },
  ];

  afterAll(() => {
    vi.useRealTimers();
  });

  describe("create", () => {
    it("should return the awaited status on success", async () => {
      const contentStore = useContentStore();
      const createMock = vi.fn(() => {
        return {
          status: "completed",
        };
      });

      const uploadFileMock = vi.fn(() => {
        return {
          error: null,
          data: {
            path: "0.284815154.png",
          },
        };
      });

      vi.spyOn(imageService, "uploadFile", "get").mockReturnValueOnce(
        uploadFileMock,
      );
      vi.spyOn(contentService, "create", "get").mockReturnValueOnce(createMock);

      const authStore = useAuthStore();
      authStore.session = {
        user: {
          email: "test@gmail.com",
        },
      };

      const imageName = 0.18201;
      Math.random = vi.fn().mockReturnValueOnce(imageName);

      const creationResponse = await contentStore.create({
        title: "My amazing title",
        badges,
        explanation: "<p>My explanation</p>",
        illustration: new File([""], "image.png", { type: "image/png" }),
      });

      expect(uploadFileMock).toHaveBeenCalledTimes(1);
      expect(uploadFileMock).toHaveBeenCalledWith(
        new File([""], "image.png", {
          type: "image/png",
          lastModified: 1696723200000,
        }),
        `${imageName}.png`,
      );

      expect(createMock).toHaveBeenCalledTimes(1);
      expect(createMock).toHaveBeenCalledWith(
        {
          title: "My amazing title",
          explanation: "<p>My explanation</p>",
          badges,
          illustration: "0.284815154.png",
        },
        "test@gmail.com",
      );
      expect(creationResponse).toEqual({
        status: "success",
      });
    });

    it("should return the awaited error when the image upload has failed", async () => {
      const contentStore = useContentStore();
      const uploadFileMock = vi.fn(() => {
        return {
          error: {},
          data: null,
        };
      });

      const createMock = vi.fn();
      vi.spyOn(imageService, "uploadFile", "get").mockReturnValueOnce(
        uploadFileMock,
      );

      const authStoreUseForImage = useAuthStore();
      authStoreUseForImage.session = {
        user: {
          email: "test@gmail.com",
        },
      };

      Math.random = vi.fn().mockReturnValueOnce(0.2584);
      const creationResponse = await contentStore.create({
        title: "My amazing title",
        badges,
        explanation: "<p>My explanation</p>",
        illustration: new File([""], "image.png", { type: "image/png" }),
      });

      expect(uploadFileMock).toHaveBeenCalledTimes(1);
      expect(uploadFileMock).toHaveBeenCalledWith(
        new File([""], "image.png", {
          type: "image/png",
          lastModified: 1696723200000,
        }),
        "0.2584.png",
      );

      expect(createMock).toHaveBeenCalledTimes(0);
      expect(creationResponse).toEqual({
        status: "error",
        message: GenericErrors.REQUEST_FAILED,
      });
    });

    it("should return the awaited response when the creation is incomplete", async () => {
      const contentStore = useContentStore();
      const createMock = vi.fn(() => {
        return {
          status: "incomplete",
        };
      });

      const uploadFileMock = vi.fn(() => {
        return {
          error: null,
          data: {
            path: "0.294815154.png",
          },
        };
      });

      vi.spyOn(imageService, "uploadFile", "get").mockReturnValueOnce(
        uploadFileMock,
      );
      vi.spyOn(contentService, "create", "get").mockReturnValueOnce(createMock);

      const authStore = useAuthStore();
      authStore.session = {
        user: {
          email: "test9@gmail.com",
        },
      };

      const imageName2 = 0.38201;
      Math.random = vi.fn().mockReturnValueOnce(imageName2);

      const creationResponse = await contentStore.create({
        title: "My amazing title",
        badges,
        explanation: "<p>My explanation</p>",
        illustration: new File([""], "image.png", { type: "image/png" }),
      });

      expect(uploadFileMock).toHaveBeenCalledTimes(1);
      expect(uploadFileMock).toHaveBeenCalledWith(
        new File([""], "image.png", {
          type: "image/png",
          lastModified: 1696723200000,
        }),
        `${imageName2}.png`,
      );

      expect(createMock).toHaveBeenCalledTimes(1);
      expect(createMock).toHaveBeenCalledWith(
        {
          title: "My amazing title",
          explanation: "<p>My explanation</p>",
          badges,
          illustration: "0.294815154.png",
        },
        "test9@gmail.com",
      );
      expect(creationResponse).toEqual({
        status: "error",
        message: GenericErrors.REQUEST_FAILED,
      });
    });
  });
});
