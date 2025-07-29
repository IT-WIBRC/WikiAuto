import { expect, vi } from "vitest";
import {
  flushPromises as vueFlushPromises,
  type VueWrapper,
} from "@vue/test-utils";
import { createTestingPinia, type TestingPinia } from "@pinia/testing";

import {
  mockSuccess,
  mockError,
  mockInfo,
  mockWarning,
  mockDismissAll,
  mockRemoveToastById,
} from "~/tests/mocks/mockUseToast";
import type { ToastOptionParam } from "~/types/toast";
import { FetchError, type FetchResponse } from "ofetch";
import { StatusCodes } from "http-status-codes";
import { GenericErrors } from "~/api";

export default (() => {
  const mockFetch = (returnValue: Blob) => {
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        blob: () => Promise.resolve(returnValue),
      }),
    );
  };

  const flushPromises = async (wrapper?: VueWrapper) => {
    if (wrapper) {
      vi.advanceTimersByTime(50);
      await vueFlushPromises();
      await wrapper.vm.$nextTick();
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 0));
  };

  const spyOnScreenSize = (width: number): void => {
    vi.spyOn(window, "innerWidth", "get").mockReturnValueOnce(width);
  };

  const getFetchError = ({
    message,
    statusCode,
    code,
  }: {
    message: string;
    statusCode: keyof typeof StatusCodes;
    code?: keyof typeof GenericErrors;
  }): FetchError => {
    const fetchErrorMock = new FetchError(message);
    fetchErrorMock.statusCode = StatusCodes[statusCode];
    fetchErrorMock.response = {
      _data: {
        code: code ? GenericErrors[code] : GenericErrors.UNKNOWN_ERROR,
      },
    } as FetchResponse<unknown>;
    return fetchErrorMock;
  };

  const createFile = ({
    size,
    name,
    type,
    content,
  }: {
    name: string;
    type: string;
    size: number;
    content?: Blob;
  }): File => {
    const newFile = new File([content ?? ""], name, { type });
    Object.defineProperty(newFile, "size", { value: size });

    return newFile;
  };

  const getPiniaInstance = ({
    stubActions,
  }: {
    stubActions: boolean;
  }): TestingPinia => {
    return createTestingPinia({
      createSpy: vi.fn,
      stubActions: stubActions,
    });
  };

  const getMockContentList = () => {
    return [
      {
        content_id: "12345",
        explanation: "Explanation 0",
        status: "VALIDATED",
        title: "My title",
        user_email: "email@email.com",
        image: "0.0251.png",
        badges: [
          {
            badge_id: "7b72146b-403c-4837-abe5-5d884af8cc35",
            description: "description 1",
            name: "badge-service 1",
          },
        ],
        updated_at: "2024-12-14 18:45:28",
        created_at: "2024-10-14 18:45:28",
      },
      {
        content_id: "123456",
        status: "PENDING",
        explanation: "Explanation 1",
        title: "My title 2",
        image: "0.0281.png",
        user_email: "email2@email.com",
        badges: [
          {
            badge_id: "68330b2f-1555-46cb-bc2f-c99a1afb5923",
            description: "description 10",
            name: "badge-service 10",
          },
          {
            badge_id: "29370a87-93e5-4548-b9c5-277701a64893",
            description: "description 2",
            name: "badge-service 11",
          },
          {
            badge_id: "b04b94f6-ac53-41bd-a051-cb5f2003f3db",
            description: "description 3",
            name: "badge-service 12",
          },
        ],
        updated_at: "2024-12-18 13:25:08",
        created_at: "2024-11-14 18:45:28",
      },
    ] as const;
  };

  const getMockBadges = () => {
    return [
      {
        badge_id: "1",
        name: "Radio",
        description: "description",
      },
      {
        badge_id: "2",
        name: "Radio 2",
        description: "description",
      },
      {
        badge_id: "3",
        name: "shoutcast",
        description: "description",
      },
      {
        badge_id: "4",
        name: "icecast",
        description: "description",
      },
    ] as const;
  };

  const toastAssertions = {
    _expectToastCalledWithArgs: (
      mockFn: ReturnType<typeof vi.fn>,
      message?: string,
      options?: ToastOptionParam,
    ) => {
      expect(mockFn).toHaveBeenCalledTimes(1);
      if (message !== undefined) {
        if (options !== undefined) {
          expect(mockFn).toHaveBeenCalledWith(message, options);
        } else {
          expect(mockFn).toHaveBeenCalledWith(message);
        }
      }
    },

    expectSuccessCalled: (message?: string, options?: ToastOptionParam) => {
      toastAssertions._expectToastCalledWithArgs(mockSuccess, message, options);
    },

    expectErrorCalled: (message?: string, options?: ToastOptionParam) => {
      toastAssertions._expectToastCalledWithArgs(mockError, message, options);
    },

    expectInfoCalled: (message?: string, options?: ToastOptionParam) => {
      toastAssertions._expectToastCalledWithArgs(mockInfo, message, options);
    },

    expectWarningCalled: (message?: string, options?: ToastOptionParam) => {
      toastAssertions._expectToastCalledWithArgs(mockWarning, message, options);
    },

    expectDismissAllCalled: () => {
      expect(mockDismissAll).toHaveBeenCalledTimes(1);
    },

    expectRemoveToastByIdCalled: (id: string) => {
      expect(mockRemoveToastById).toHaveBeenCalledTimes(1);
      expect(mockRemoveToastById).toHaveBeenCalledWith(id);
    },

    expectNoToastCalled: () => {
      expect(mockSuccess).not.toHaveBeenCalled();
      expect(mockError).not.toHaveBeenCalled();
      expect(mockInfo).not.toHaveBeenCalled();
      expect(mockWarning).not.toHaveBeenCalled();
    },

    expectAnyToastCalled: () => {
      expect(
        mockSuccess.mock.calls.length > 0 ||
          mockError.mock.calls.length > 0 ||
          mockInfo.mock.calls.length > 0 ||
          mockWarning.mock.calls.length > 0,
      ).toBe(true);
    },

    expectToastOfTypeCalled: (
      type: "success" | "error" | "info" | "warning",
      message?: string,
      options?: ToastOptionParam,
    ) => {
      switch (type) {
        case "success":
          toastAssertions.expectSuccessCalled(message, options);
          break;
        case "error":
          toastAssertions.expectErrorCalled(message, options);
          break;
        case "info":
          toastAssertions.expectInfoCalled(message, options);
          break;
        case "warning":
          toastAssertions.expectWarningCalled(message, options);
          break;
      }
    },
  };

  return {
    mockFetch,
    flushPromises,
    createFile,
    spyOnScreenSize,
    getPiniaInstance,
    getMockBadges,
    getMockContentList,
    toastAssertions,
    getFetchError,
  };
})();
