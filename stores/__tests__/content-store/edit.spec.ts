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
import { CONTENT_STATUS, GenericErrors } from "../../../api/types";

describe("ContentStore", () => {
  beforeEach(() => {
    vi.setSystemTime(new Date(2023, 10, 8, 0, 0, 0));
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

  describe("Edit", () => {
    it("should return the awaited status on success edition", async () => {
      const contentStore = useContentStore();
      const editMock = vi.fn(() => {
        return {
          status: "completed",
        };
      });

      const uploadFileMock = vi.fn(() => {
        return {
          error: null,
          data: {
            path: "0.284815156.png",
          },
        };
      });

      vi.spyOn(imageService, "uploadFile", "get").mockReturnValueOnce(
        uploadFileMock,
      );
      vi.spyOn(contentService, "edit", "get").mockReturnValueOnce(editMock);

      const imageName = 0.18201;
      Math.random = vi.fn().mockReturnValueOnce(imageName);

      const creationResponse = await contentStore.edit({
        title: "My amazing title",
        badges,
        explanation: "<p>My explanation</p>",
        illustration: new File([""], "image.png", { type: "image/png" }),
        status: "PENDING",
        userEmail: "email@email.com",
        id: "1234549845",
      });

      expect(uploadFileMock).toHaveBeenCalledTimes(1);
      expect(uploadFileMock).toHaveBeenCalledWith(
        new File([""], "image.png", {
          type: "image/png",
          lastModified: 1699401600000,
        }),
        `${imageName}.png`,
      );

      expect(editMock).toHaveBeenCalledTimes(1);
      expect(editMock).toHaveBeenCalledWith({
        title: "My amazing title",
        explanation: "<p>My explanation</p>",
        badges,
        illustration: "0.284815156.png",
        status: CONTENT_STATUS.PENDING,
        userEmail: "email@email.com",
        id: "1234549845",
      });
      expect(creationResponse).toEqual({
        status: "success",
      });
    });

    it("should return the awaited status on success when the illustration has not been changed", async () => {
      const contentStore = useContentStore();
      const editMock = vi.fn(() => {
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
      vi.spyOn(contentService, "edit", "get").mockReturnValueOnce(editMock);

      const imageName = 0.18201;
      Math.random = vi.fn().mockReturnValueOnce(imageName);

      const creationResponse = await contentStore.edit({
        title: "My amazing title",
        badges,
        explanation: "<p>My explanation</p>",
        illustration: new File([""], "0.235184.png", { type: "image/png" }),
        status: "PENDING",
        userEmail: "email@email.com",
        id: "1234549845",
      });

      expect(uploadFileMock).toHaveBeenCalledTimes(1);
      expect(uploadFileMock).toHaveBeenCalledWith(
        new File([""], "0.235184.png", {
          type: "image/png",
          lastModified: 1699401600000,
        }),
        "0.235184.png",
      );

      expect(editMock).toHaveBeenCalledTimes(1);
      expect(editMock).toHaveBeenCalledWith({
        title: "My amazing title",
        explanation: "<p>My explanation</p>",
        badges,
        illustration: "0.284815154.png",
        status: CONTENT_STATUS.PENDING,
        userEmail: "email@email.com",
        id: "1234549845",
      });
      expect(creationResponse).toEqual({
        status: "success",
      });
    });

    it("should return the awaited error when the image upload has failed", async () => {
      const uploadFileMock2 = vi.fn(() => {
        return {
          error: {},
          data: null,
        };
      });

      const editMock = vi.fn();
      vi.spyOn(imageService, "uploadFile", "get").mockReturnValueOnce(
        uploadFileMock2,
      );

      const authStoreUseForImage = useAuthStore();
      authStoreUseForImage.session = {
        user: {
          email: "test@gmail.com",
        },
      };

      Math.random = vi.fn().mockReturnValueOnce(0.2584);
      const creationResponse = await useContentStore().edit({
        title: "My amazing title",
        badges,
        explanation: "<p>My explanation</p>",
        illustration: new File([""], "image.png", { type: "image/png" }),
        status: CONTENT_STATUS.PENDING,
        userEmail: "email@email.com",
        id: "1234549845",
      });

      expect(uploadFileMock2).toHaveBeenCalledTimes(1);
      expect(uploadFileMock2).toHaveBeenCalledWith(
        new File([""], "image.png", {
          type: "image/png",
          lastModified: 1699401600000,
        }),
        "0.2584.png",
      );

      expect(editMock).toHaveBeenCalledTimes(0);
      expect(creationResponse).toEqual({
        status: "error",
        message: GenericErrors.REQUEST_FAILED,
      });
    });

    it("should return the awaited response when the creation is incomplete", async () => {
      const contentStore = useContentStore();
      const editMock = vi.fn(() => {
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
      vi.spyOn(contentService, "edit", "get").mockReturnValueOnce(editMock);

      const authStore = useAuthStore();
      authStore.session = {
        user: {
          email: "test9@gmail.com",
        },
      };

      const imageName2 = 0.38201;
      Math.random = vi.fn().mockReturnValueOnce(imageName2);

      const creationResponse = await contentStore.edit({
        title: "My amazing title",
        badges,
        explanation: "<p>My explanation</p>",
        illustration: new File([""], "image.png", { type: "image/png" }),
        status: CONTENT_STATUS.PENDING,
        userEmail: "email@email.com",
        id: "1234549845",
      });

      expect(uploadFileMock).toHaveBeenCalledTimes(1);
      expect(uploadFileMock).toHaveBeenCalledWith(
        new File([""], "image.png", {
          type: "image/png",
          lastModified: 1699401600000,
        }),
        `${imageName2}.png`,
      );

      expect(editMock).toHaveBeenCalledTimes(1);
      expect(editMock).toHaveBeenCalledWith({
        title: "My amazing title",
        explanation: "<p>My explanation</p>",
        badges,
        illustration: "0.294815154.png",
        status: CONTENT_STATUS.PENDING,
        userEmail: "email@email.com",
        id: "1234549845",
      });
      expect(creationResponse).toEqual({
        status: "error",
        message: GenericErrors.REQUEST_FAILED,
      });
    });
  });
});
