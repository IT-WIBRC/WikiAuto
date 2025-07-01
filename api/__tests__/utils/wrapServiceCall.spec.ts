import { describe, it, expect } from "vitest";
import { wrapServiceCall, GenericErrors } from "~/api";
import { AuthError } from "@supabase/auth-js";
import type { IEither } from "~/api/utils/monads";
import type {
  PostgrestResponseFailure,
  PostgrestError,
} from "@supabase/postgrest-js";

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

function createPostgrestErrorResponse({
  code,
  message,
  status,
  statusText,
}: {
  code: string;
  message: string;
  status: number;
  statusText: string;
}): PostgrestResponseFailure {
  return {
    error: {
      code,
      message,
      details: "",
      hint: "",
    } as PostgrestError,
    status,
    statusText,
    data: null,
    count: null,
  };
}

describe("wrapServiceCall", () => {
  it("returns a Right with data and count when the service responds with both", async () => {
    const servicePromise = Promise.resolve({
      data: { foo: "bar" },
      count: 1,
      error: null,
      status: 200,
      statusText: "OK",
    });
    const result = await wrapServiceCall(servicePromise);
    expectRight(result, (success) => {
      expect(success.status).toBe("success");
      expect(success.data).toEqual({ foo: "bar" });
      expect(success.count).toBe(1);
    });
  });

  it("returns a Right with data and null count when the service responds with data but count is null", async () => {
    const servicePromise = Promise.resolve({
      data: [1, 2, 3],
      error: null,
      count: null,
      status: 200,
      statusText: "OK",
    });
    const result = await wrapServiceCall(servicePromise);
    expectRight(result, (success) => {
      expect(success.status).toBe("success");
      expect(success.data).toEqual([1, 2, 3]);
      expect(success.count).toBeNull();
    });
  });

  it("returns a Right with null data and null count for an AuthResponse with null data", async () => {
    const servicePromise = Promise.resolve({
      data: null,
      error: null,
      count: null,
      status: 200,
      statusText: "OK",
    });
    const result = await wrapServiceCall(servicePromise);
    expectRight(result, (success) => {
      expect(success.status).toBe("success");
      expect(success.data).toBeNull();
      expect(success.count).toBeNull();
    });
  });

  it("returns a Right with user data for an AuthResponse with user", async () => {
    const servicePromise = Promise.resolve({
      data: {
        user: {
          id: "123",
          email: "test@example.com",
        },
      },
      error: null,
      count: null,
      status: 200,
      statusText: "OK",
    });
    const result = await wrapServiceCall(servicePromise);
    expectRight(result, (success) => {
      expect(success.status).toBe("success");
      expect(success.data).toEqual({
        user: {
          id: "123",
          email: "test@example.com",
        },
      });
      expect(success.count).toBeNull();
    });
  });

  it("returns a Right with session data for an AuthResponse with session", async () => {
    const servicePromise = Promise.resolve({
      data: { session: { access_token: "token" } },
      error: null,
      count: null,
      status: 200,
      statusText: "OK",
    });
    const result = await wrapServiceCall(servicePromise);
    expectRight(result, (success) => {
      expect(success.status).toBe("success");
      expect(success.data).toEqual({ session: { access_token: "token" } });
      expect(success.count).toBeNull();
    });
  });

  it("returns a Left with UNAUTHORIZED for AuthApiError with invalid credentials", async () => {
    const servicePromise = Promise.resolve({
      error: new AuthError("Invalid login credentials", 401),
      data: {
        user: null,
        session: null,
      },
    });
    const result = await wrapServiceCall(servicePromise);
    expectLeft(result, (error) => {
      expect(error.status).toBe("error");
      expect(error.message).toBe(GenericErrors.UNAUTHORIZED);
    });
  });

  it("returns a Left with CONFLICT for AuthApiError with duplicate user", async () => {
    const servicePromise = Promise.resolve({
      error: new AuthError("duplicate_user", 409),
      data: {
        user: null,
        session: null,
      },
    });
    const result = await wrapServiceCall(servicePromise);
    expectLeft(result, (error) => {
      expect(error.status).toBe("error");
      expect(error.message).toBe(GenericErrors.CONFLICT);
    });
  });

  it("returns a Left with UNAUTHORIZED for AuthApiError with email not confirmed", async () => {
    const servicePromise = Promise.resolve({
      error: new AuthError("email_not_confirmed", 401),
      data: {
        user: null,
        session: null,
      },
    });
    const result = await wrapServiceCall(servicePromise);
    expectLeft(result, (error) => {
      expect(error.status).toBe("error");
      expect(error.message).toBe(GenericErrors.EMAIL_NOT_VERIFIED);
    });
  });

  it("returns a Left with RATE_LIMIT_EXCEEDED for AuthApiError with throttled", async () => {
    const servicePromise = Promise.resolve({
      error: new AuthError("throttled", 429),
      data: {
        user: null,
        session: null,
      },
    });
    const result = await wrapServiceCall(servicePromise);
    expectLeft(result, (error) => {
      expect(error.status).toBe("error");
      expect(error.message).toBe(GenericErrors.RATE_LIMIT_EXCEEDED);
    });
  });

  it("returns a Left with NOT_FOUND for AuthApiError with not_found", async () => {
    const servicePromise = Promise.resolve({
      error: new AuthError("not_found", 404),
      data: {
        user: null,
        session: null,
      },
    });
    const result = await wrapServiceCall(servicePromise);
    expectLeft(result, (error) => {
      expect(error.status).toBe("error");
      expect(error.message).toBe(GenericErrors.NOT_FOUND);
    });
  });

  it("returns a Left with BAD_REQUEST for PostgrestError with code '23503'", async () => {
    const servicePromise = Promise.resolve(
      createPostgrestErrorResponse({
        code: "23503",
        message: "bad request",
        status: 400,
        statusText: "",
      }),
    );
    const result = await wrapServiceCall(servicePromise);
    expectLeft(result, (error) => {
      expect(error.status).toBe("error");
      expect(error.message).toBe(GenericErrors.BAD_REQUEST);
    });
  });

  it("returns a Left with UNAUTHORIZED for PostgrestError with code '401'", async () => {
    const servicePromise = Promise.resolve(
      createPostgrestErrorResponse({
        code: "401",
        message: "unauthorized",
        status: 401,
        statusText: "",
      }),
    );
    const result = await wrapServiceCall(servicePromise);
    expectLeft(result, (error) => {
      expect(error.status).toBe("error");
      expect(error.message).toBe(GenericErrors.UNAUTHORIZED);
    });
  });

  it("returns a Left with FORBIDDEN for PostgrestError with code '403'", async () => {
    const servicePromise = Promise.resolve(
      createPostgrestErrorResponse({
        code: "403",
        message: "forbidden",
        status: 403,
        statusText: "",
      }),
    );
    const result = await wrapServiceCall(servicePromise);
    expectLeft(result, (error) => {
      expect(error.status).toBe("error");
      expect(error.message).toBe(GenericErrors.FORBIDDEN);
    });
  });

  it("returns a Left with CONFLICT for PostgrestError with code '409'", async () => {
    const servicePromise = Promise.resolve(
      createPostgrestErrorResponse({
        code: "409",
        message: "conflict",
        status: 409,
        statusText: "",
      }),
    );
    const result = await wrapServiceCall(servicePromise);
    expectLeft(result, (error) => {
      expect(error.status).toBe("error");
      expect(error.message).toBe(GenericErrors.CONFLICT);
    });
  });

  it("returns a Left with RATE_LIMIT_EXCEEDED for PostgrestError with code '429'", async () => {
    const servicePromise = Promise.resolve(
      createPostgrestErrorResponse({
        code: "429",
        message: "rate limit",
        status: 429,
        statusText: "",
      }),
    );
    const result = await wrapServiceCall(servicePromise);
    expectLeft(result, (error) => {
      expect(error.status).toBe("error");
      expect(error.message).toBe(GenericErrors.RATE_LIMIT_EXCEEDED);
    });
  });

  it("returns a Left with SERVER_ERROR for PostgrestError with code '500'", async () => {
    const servicePromise = Promise.resolve(
      createPostgrestErrorResponse({
        code: "500",
        message: "server error",
        status: 500,
        statusText: "",
      }),
    );
    const result = await wrapServiceCall(servicePromise);
    expectLeft(result, (error) => {
      expect(error.status).toBe("error");
      expect(error.message).toBe(GenericErrors.SERVER_ERROR);
    });
  });

  it("returns a Left with SERVER_ERROR for PostgrestError with code '503'", async () => {
    const servicePromise = Promise.resolve(
      createPostgrestErrorResponse({
        code: "503",
        message: "service unavailable",
        status: 503,
        statusText: "",
      }),
    );
    const result = await wrapServiceCall(servicePromise);
    expectLeft(result, (error) => {
      expect(error.status).toBe("error");
      expect(error.message).toBe(GenericErrors.SERVER_ERROR);
    });
  });

  it("returns a Left with SERVER_ERROR for PostgrestError with code '504'", async () => {
    const servicePromise = Promise.resolve(
      createPostgrestErrorResponse({
        code: "504",
        message: "gateway timeout",
        status: 504,
        statusText: "",
      }),
    );
    const result = await wrapServiceCall(servicePromise);
    expectLeft(result, (error) => {
      expect(error.status).toBe("error");
      expect(error.message).toBe(GenericErrors.SERVER_ERROR);
    });
  });

  it("returns a Left with SERVER_ERROR for PostgrestError with code '544'", async () => {
    const servicePromise = Promise.resolve(
      createPostgrestErrorResponse({
        code: "544",
        message: "internal error",
        status: 500,
        statusText: "",
      }),
    );
    const result = await wrapServiceCall(servicePromise);
    expectLeft(result, (error) => {
      expect(error.status).toBe("error");
      expect(error.message).toBe(GenericErrors.SERVER_ERROR);
    });
  });

  it("returns a Left with UNKNOWN_ERROR for an unknown PostgrestError code", async () => {
    const servicePromise = Promise.resolve(
      createPostgrestErrorResponse({
        code: "SOME_UNKNOWN_CODE",
        message: "unknown",
        status: 500,
        statusText: "",
      }),
    );
    const result = await wrapServiceCall(servicePromise);
    expectLeft(result, (error) => {
      expect(error.status).toBe("error");
      expect(error.message).toBe(GenericErrors.UNKNOWN_ERROR);
    });
  });

  it("returns a Left with UNKNOWN_ERROR for an unknown AuthApiError message", async () => {
    const servicePromise = Promise.resolve({
      error: new AuthError("some_unknown_message", 500),
      data: {
        user: null,
        session: null,
      },
    });
    const result = await wrapServiceCall(servicePromise);
    expectLeft(result, (error) => {
      expect(error.status).toBe("error");
      expect(error.message).toBe(GenericErrors.UNKNOWN_ERROR);
    });
  });

  it("returns a Left with NETWORK_ERROR for a DOMException with name AbortError", async () => {
    const servicePromise = Promise.reject(
      new DOMException("Aborted", "AbortError"),
    );
    const result = await wrapServiceCall(servicePromise);
    expectLeft(result, (error) => {
      expect(error.status).toBe("error");
      expect(error.message).toBe(GenericErrors.NETWORK_ERROR);
    });
  });

  it("returns a Left with TIMEOUT for an error message containing 'timed out'", async () => {
    const servicePromise = Promise.reject(new Error("The request timed out"));
    const result = await wrapServiceCall(servicePromise);
    expectLeft(result, (error) => {
      expect(error.status).toBe("error");
      expect(error.message).toBe(GenericErrors.TIMEOUT);
    });
  });

  it("returns a Right for an unexpected successful response structure", async () => {
    const servicePromise = Promise.resolve({
      foo: "bar",
      error: null,
      data: null,
      count: null,
      status: 200,
      statusText: "OK",
    });
    const result = await wrapServiceCall(servicePromise);
    expectRight(result, (success) => {
      expect(success.status).toBe("success");
      expect(success.data).toBeNull();
      expect(success.count).toBeNull();
    });
  });
});
