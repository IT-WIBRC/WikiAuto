import { describe, it, expect } from "vitest";
import { wrapServiceCall } from "../wrapServiceCall";
import { GenericErrors } from "../types";

describe("wrapServiceCall", () => {
  it("returns success with response property containing data and count", async () => {
    const servicePromise = Promise.resolve({
      data: { foo: "bar" },
      count: 1,
    });
    const result = await wrapServiceCall(servicePromise);
    expect(result).toEqual({
      status: "success",
      response: {
        data: { foo: "bar" },
        count: 1,
      },
    });
  });

  it("returns success with response property when count is undefined", async () => {
    const servicePromise = Promise.resolve({ data: [1, 2, 3] });
    const result = await wrapServiceCall(servicePromise);
    expect(result).toEqual({
      status: "success",
      response: {
        data: [1, 2, 3],
        count: undefined,
      },
    });
  });

  it("returns BAD_REQUEST for invalid_credentials", async () => {
    const servicePromise = Promise.resolve({
      error: { code: "invalid_credentials" },
    });
    const result = await wrapServiceCall(servicePromise);
    expect(result).toEqual({
      status: "error",
      message: GenericErrors.BAD_REQUEST,
    });
  });

  it("returns BAD_REQUEST for MissingParameter", async () => {
    const servicePromise = Promise.resolve({
      error: { code: "MissingParameter" },
    });
    const result = await wrapServiceCall(servicePromise);
    expect(result).toEqual({
      status: "error",
      message: GenericErrors.BAD_REQUEST,
    });
  });

  it("returns NOT_FOUND for NotFound", async () => {
    const servicePromise = Promise.resolve({ error: { code: "NotFound" } });
    const result = await wrapServiceCall(servicePromise);
    expect(result).toEqual({
      status: "error",
      message: GenericErrors.NOT_FOUND,
    });
  });

  it("returns REQUEST_FAILED for RequestFailed", async () => {
    const servicePromise = Promise.resolve({
      error: { code: "RequestFailed" },
    });
    const result = await wrapServiceCall(servicePromise);
    expect(result).toEqual({
      status: "error",
      message: GenericErrors.REQUEST_FAILED,
    });
  });

  it("returns NETWORK_ERROR for NetworkError", async () => {
    const servicePromise = Promise.resolve({ error: { code: "NetworkError" } });
    const result = await wrapServiceCall(servicePromise);
    expect(result).toEqual({
      status: "error",
      message: GenericErrors.NETWORK_ERROR,
    });
  });

  it("returns UNKNOWN_ERROR for UnknownError", async () => {
    const servicePromise = Promise.resolve({ error: { code: "UnknownError" } });
    const result = await wrapServiceCall(servicePromise);
    expect(result).toEqual({
      status: "error",
      message: GenericErrors.UNKNOWN_ERROR,
    });
  });

  it("returns SERVER_ERROR for unknown error code", async () => {
    const servicePromise = Promise.resolve({
      error: { code: "SomethingElse" },
    });
    const result = await wrapServiceCall(servicePromise);
    expect(result).toEqual({
      status: "error",
      message: GenericErrors.SERVER_ERROR,
    });
  });

  it("returns SERVER_ERROR if promise rejects", async () => {
    const servicePromise = Promise.reject(new Error("fail"));
    const result = await wrapServiceCall(servicePromise);
    expect(result).toEqual({
      status: "error",
      message: GenericErrors.SERVER_ERROR,
    });
  });
});
