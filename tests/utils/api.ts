import { vi } from "vitest";
import type { MockH3EventComplete } from "../types/test-utils";
import type { StatusCodes } from "http-status-codes";
import type { IncomingMessage } from "http";

type EventParams = {
    statusCode: StatusCodes;
    method: "POST" | "GET" | "PUT";
    path?: string;
};

export const createMockEvent = (
  params: EventParams
): MockH3EventComplete => {
  return {
    node: {
      req: {} as IncomingMessage,
      res: {
        statusCode: params.statusCode,
        statusMessage: "",
        setHeader: vi.fn(),
        end: vi.fn(),
      },
    },
    __is_event__: true,
    context: {},
    _handled: false,
    _onBeforeResponseCalled: false,
    _onAfterResponseCalled: false,
    method: params.method,
    path: params.path || "/api/",
    headers: {},
    query: {},
    params: {},
    body: null
  } as unknown as MockH3EventComplete;
};
