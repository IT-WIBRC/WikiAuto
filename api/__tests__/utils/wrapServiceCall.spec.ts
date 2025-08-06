import { describe, it, expect, vi } from "vitest";
import { wrapServiceCall, GenericErrors } from "~/api";
import type { IEither } from "~/api/utils/monads";
import useTestUtils from "~/tests/utils/ui";

function expectRight<T>(
  either: IEither<unknown, T>,
  check: (value: T) => void,
) {
  expect(either.isRight()).toBe(true);
  either.fold(() => expect(false).toBe(true), check);
}

function expectLeft<T>(either: IEither<T, unknown>, check: (value: T) => void) {
  expect(either.isLeft()).toBe(true);
  either.fold(check, () => expect(false).toBe(true));
}

describe("wrapServiceCall", () => {
  it("returns a Right with data as a literal object on success", async () => {
    const servicePromise = Promise.resolve({ foo: "bar" });
    const result = await wrapServiceCall(servicePromise);
    expectRight(result, (success) => {
      expect(success.status).toBe("success");
      expect(success.data).toEqual({ foo: "bar" });
    });
  });

  it("returns a Right with data as an array on success", async () => {
    const servicePromise = Promise.resolve([1, 2, 3]);
    const result = await wrapServiceCall(servicePromise);
    expectRight(result, (success) => {
      expect(success.status).toBe("success");
      expect(success.data).toEqual([1, 2, 3]);
    });
  });

  it("returns a Left with a standard error on failure", async () => {
    const fetchErrorClassMock = useTestUtils.getFetchError({
      message: "User cannot have access to this.",
      statusCode: "UNAUTHORIZED",
      code: "UNAUTHORIZED",
    });

    const servicePromise = Promise.reject(fetchErrorClassMock);
    const result = await wrapServiceCall(servicePromise);
    expectLeft(result, (error) => {
      expect(error.status).toBe("error");
      expect(error.message).toBe(GenericErrors.UNAUTHORIZED);
    });
  });

  it("returns a Left with a standard error on native error", async () => {
    const networkErrorClassMock = new TypeError("network error.");

    const servicePromise = Promise.reject(networkErrorClassMock);
    const result = await wrapServiceCall(servicePromise);
    expectLeft(result, (error) => {
      expect(error.status).toBe("error");
      expect(error.message).toBe(GenericErrors.NETWORK_ERROR);
    });
  });

  it("returns a Left with a standard awaited error when unknown error occurs from the user", async () => {
    const unknownErrorClassMock = new Error("unknown error.");
    const consoleErrorSpy = vi.spyOn(console, "error");

    const servicePromise = Promise.reject(unknownErrorClassMock);
    const result = await wrapServiceCall(servicePromise);
    expectLeft(result, (error) => {
      expect(error.status).toBe("error");
      expect(error.message).toBe(GenericErrors.UNKNOWN_ERROR);
    });
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Caught an unexpected error type in mapErrorToResponseOnError:",
      unknownErrorClassMock.message,
      unknownErrorClassMock,
    );
  });

  it("returns a Left with a standard awaited error when unknown error occurs from the api", async () => {
    const fetchUnknownErrorClassMock = useTestUtils.getFetchError({
      message: "User cannot have access to this.",
      statusCode: "UNAUTHORIZED",
      code: "UNKNOWN_ERROR",
    });

    const servicePromise = Promise.reject(fetchUnknownErrorClassMock);
    const result = await wrapServiceCall(servicePromise);
    expectLeft(result, (error) => {
      expect(error.status).toBe("error");
      expect(error.message).toBe(GenericErrors.UNKNOWN_ERROR);
    });
  });
});
