import type {
  H3Event, EventHandlerRequest, H3EventContext
} from "h3";
import type { IncomingMessage, ServerResponse } from "http";
import type { MockedFunction } from "vitest";

export type MockH3Event = Partial<H3Event<EventHandlerRequest>> & {
    node: {
        req: Partial<IncomingMessage>;
        res: Partial<ServerResponse> & { statusCode: number };
    };
    __is_event__: true;
    context: H3EventContext;
    _handled: boolean;
};

export type MockH3EventComplete = H3Event & {
    node: {
        req: IncomingMessage;
        res: MockedServerResponse;
    };
};

export interface MockedServerResponse {
    statusCode: number;
    statusMessage: string;
    setHeader: MockedFunction<(...args: unknown[]) => void>;
    end: MockedFunction<(...args: unknown[]) => void>;
}
