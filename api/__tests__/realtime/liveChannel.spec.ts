/* eslint-disable @typescript-eslint/no-explicit-any */
import { LiveChannelCore, LiveChannel } from "../../realtime/liveChannel";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import type { SupabaseChannel } from "../../types";

const mockSupabase = {
  channel: vi.fn().mockReturnValue({
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnThis(),
    unsubscribe: vi.fn().mockResolvedValue(""),
  }),
  removeChannel: vi.fn(),
};

vi.mock("~/api/supabaseInit", () => ({
  default: () => mockSupabase,
}));

describe("LiveChannelCore", () => {
  let liveChannelCore: LiveChannelCore<"badges">;

  beforeEach(() => {
    liveChannelCore = new LiveChannelCore("badges");
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
    if (liveChannelCore) {
      liveChannelCore["socket"] = null;
      liveChannelCore["conduit"] = null;
      liveChannelCore["isConnected"] = false;
      liveChannelCore["awaitingConnection"] = [];
      if (typeof liveChannelCore["activeHandlers"]?.clear === "function") {
        liveChannelCore["activeHandlers"].clear();
      }
    }
  });

  describe("constructor", () => {
    it("should set tableName and channelKey", () => {
      expect(liveChannelCore["tableName"]).toBe("badges");
      expect(liveChannelCore["channelKey"]).toBe("public:badges");
    });
  });

  describe("onConnectionEstablished", () => {
    it("should call attachQueuedListeners and log", () => {
      const attachQueuedListenersSpy = vi.spyOn(
        liveChannelCore as any,
        "attachQueuedListeners",
      );
      const consoleLogSpy = vi.spyOn(console, "log");

      liveChannelCore["onConnectionEstablished"]();

      expect(attachQueuedListenersSpy).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "LiveChannelCore: Conduit 'public:badges' SUBSCRIBED",
      );
    });
  });

  describe("onConnectionLost", () => {
    it("should set isConnected to false, call clearQueuedListeners, and log error", () => {
      const clearQueuedListenersSpy = vi.spyOn(
        liveChannelCore as any,
        "clearQueuedListeners",
      );
      const consoleErrorSpy = vi.spyOn(console, "error");
      liveChannelCore["isConnected"] = true;

      liveChannelCore["onConnectionLost"]("ERROR");

      expect(liveChannelCore["isConnected"]).toBe(false);
      expect(clearQueuedListenersSpy).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "LiveChannelCore: Conduit 'public:badges' status: ERROR",
      );
    });
  });

  describe("monitorConnectionStatus", () => {
    it("should call onConnectionEstablished when status is SUBSCRIBED", () => {
      const onConnectionEstablishedSpy = vi.spyOn(
        liveChannelCore as any,
        "onConnectionEstablished",
      );
      const onConnectionLostSpy = vi.spyOn(
        liveChannelCore as any,
        "onConnectionLost",
      );

      liveChannelCore["monitorConnectionStatus"]("SUBSCRIBED");

      expect(onConnectionEstablishedSpy).toHaveBeenCalled();
      expect(onConnectionLostSpy).not.toHaveBeenCalled();
    });

    it("should call onConnectionLost when status is ERROR, CLOSED, or TIMED_OUT", () => {
      const onConnectionEstablishedSpy = vi.spyOn(
        liveChannelCore as any,
        "onConnectionEstablished",
      );
      const onConnectionLostSpy = vi.spyOn(
        liveChannelCore as any,
        "onConnectionLost",
      );

      liveChannelCore["monitorConnectionStatus"]("ERROR");
      expect(onConnectionLostSpy).toHaveBeenCalledWith("ERROR");
      expect(onConnectionEstablishedSpy).not.toHaveBeenCalled();

      onConnectionLostSpy.mockClear();
      liveChannelCore["monitorConnectionStatus"]("CLOSED");
      expect(onConnectionLostSpy).toHaveBeenCalledWith("CLOSED");
      expect(onConnectionEstablishedSpy).not.toHaveBeenCalled();

      onConnectionLostSpy.mockClear();
      liveChannelCore["monitorConnectionStatus"]("TIMED_OUT");
      expect(onConnectionLostSpy).toHaveBeenCalledWith("TIMED_OUT");
      expect(onConnectionEstablishedSpy).not.toHaveBeenCalled();
    });

    it("should not call either when status is other than the specified", () => {
      const onConnectionEstablishedSpy = vi.spyOn(
        liveChannelCore as any,
        "onConnectionEstablished",
      );
      const onConnectionLostSpy = vi.spyOn(
        liveChannelCore as any,
        "onConnectionLost",
      );

      liveChannelCore["monitorConnectionStatus"]("OTHER_STATUS");

      expect(onConnectionEstablishedSpy).not.toHaveBeenCalled();
      expect(onConnectionLostSpy).not.toHaveBeenCalled();
    });
  });

  describe("attachQueuedListeners", () => {
    it("should call attachListener for each queued listener and clear the queue", () => {
      const attachListenerSpy = vi.spyOn(
        liveChannelCore as any,
        "attachListener",
      );
      const clearQueuedListenersSpy = vi.spyOn(
        liveChannelCore as any,
        "clearQueuedListeners",
      );
      const mockHandler1 = vi.fn();
      const mockHandler2 = vi.fn();
      liveChannelCore["awaitingConnection"] = [
        { event: "INSERT", handler: mockHandler1 },
        { event: "UPDATE", handler: mockHandler2 },
      ];

      liveChannelCore["attachQueuedListeners"]();

      expect(attachListenerSpy).toHaveBeenCalledTimes(2);
      expect(attachListenerSpy).toHaveBeenCalledWith("INSERT", mockHandler1);
      expect(attachListenerSpy).toHaveBeenCalledWith("UPDATE", mockHandler2);
      expect(clearQueuedListenersSpy).toHaveBeenCalled();
    });
  });

  describe("clearQueuedListeners", () => {
    it("should empty the awaitingConnection array", () => {
      liveChannelCore["awaitingConnection"] = [
        { event: "INSERT", handler: vi.fn() },
      ];
      liveChannelCore["clearQueuedListeners"]();
      expect(liveChannelCore["awaitingConnection"]).toEqual([]);
    });
  });

  describe("queueListener", () => {
    it("should add a listener to awaitingConnection if it is not already queued", () => {
      const consoleWarnSpy = vi.spyOn(console, "warn");
      const mockHandler = vi.fn();
      const listener = { event: "INSERT", handler: mockHandler };

      liveChannelCore["queueListener"](listener);

      expect(liveChannelCore["awaitingConnection"]).toContain(listener);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "LiveChannelCore: Listener for 'INSERT' pending connection on 'public:badges'.",
      );
    });

    it("should not add a listener to awaitingConnection if it is already queued, and should log a warning", () => {
      const consoleWarnSpy = vi.spyOn(console, "warn");
      const mockHandler = vi.fn();
      const listener = { event: "INSERT", handler: mockHandler };
      liveChannelCore["awaitingConnection"].push(listener);

      liveChannelCore["queueListener"](listener);

      expect(liveChannelCore["awaitingConnection"]).toEqual([listener]);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "LiveChannelCore: Listener for 'INSERT' already pending on 'public:badges'.",
      );
    });
  });

  describe("isListenerQueued", () => {
    it("should return true if the listener is in the queue", () => {
      const mockHandler = vi.fn();
      const listener = { event: "INSERT", handler: mockHandler };
      liveChannelCore["awaitingConnection"].push(listener);
      expect(liveChannelCore["isListenerQueued"](listener)).toBe(true);
    });

    it("should return false if the listener is not in the queue", () => {
      const mockHandler1 = vi.fn();
      const mockHandler2 = vi.fn();
      const listener1 = { event: "INSERT", handler: mockHandler1 };
      const listener2 = { event: "UPDATE", handler: mockHandler2 };
      liveChannelCore["awaitingConnection"].push(listener1);
      expect(liveChannelCore["isListenerQueued"](listener2)).toBe(false);
    });
  });

  describe("supabaseListen", () => {
    it("should call socket.on with correct parameters", () => {
      const mockSocket = {
        on: vi.fn().mockReturnThis(),
      } as unknown as SupabaseChannel;
      liveChannelCore["socket"] = mockSocket;
      const mockHandler = vi.fn();

      liveChannelCore["supabaseListen"]("INSERT", mockHandler);

      expect(mockSocket.on).toHaveBeenCalledWith(
        "postgres_changes",
        { schema: "public", event: "INSERT", table: "badges" },
        mockHandler,
      );
    });
  });

  describe("establishConduit", () => {
    it("should subscribe to the socket and set isConnected to true if socket exists and isConnected is false", () => {
      const mockSocket = {
        subscribe: vi.fn().mockReturnThis(),
      } as unknown as SupabaseChannel;
      liveChannelCore["socket"] = mockSocket;
      liveChannelCore["isConnected"] = false;

      liveChannelCore["establishConduit"]();

      expect(mockSocket.subscribe).toHaveBeenCalledWith(expect.any(Function));
      expect(liveChannelCore["isConnected"]).toBe(true);
    });

    it("should log conduit establishment", () => {
      const mockSocket = {
        subscribe: vi.fn().mockReturnThis(),
      } as unknown as SupabaseChannel;
      liveChannelCore["socket"] = mockSocket;
      liveChannelCore["isConnected"] = false;
      const consoleLogSpy = vi.spyOn(console, "log");

      liveChannelCore["establishConduit"]();
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "LiveChannelCore: Established conduit 'public:badges'.",
      );
    });

    it("should not subscribe if isConnected is already true", () => {
      const mockSocket = {
        subscribe: vi.fn().mockReturnThis(),
      } as unknown as SupabaseChannel;
      liveChannelCore["socket"] = mockSocket;
      liveChannelCore["isConnected"] = true;
      const consoleLogSpy = vi.spyOn(console, "log");

      liveChannelCore["establishConduit"]();

      expect(liveChannelCore["socket"]?.subscribe).not.toHaveBeenCalled();
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });

  describe("attachListener", () => {
    it("should call supabaseListen if socket and conduit exist", () => {
      const mockSocket = {
        on: vi.fn().mockReturnThis(),
      } as unknown as SupabaseChannel;
      liveChannelCore["socket"] = mockSocket;
      const supabaseListenSpy = vi
        .spyOn(liveChannelCore as any, "supabaseListen")
        .mockReturnValue({});

      const mockHandler = vi.fn();
      liveChannelCore["attachListener"]("INSERT", mockHandler);

      expect(supabaseListenSpy).toHaveBeenCalledWith("INSERT", mockHandler);
    });

    it("should queue the listener if supabaseListen returns null", () => {
      const mockSocket = {
        on: vi.fn().mockReturnThis(),
      } as unknown as SupabaseChannel;
      liveChannelCore["socket"] = mockSocket;
      vi.spyOn(liveChannelCore as any, "supabaseListen").mockReturnValue(null);
      const queueListenerSpy = vi.spyOn(
        liveChannelCore as any,
        "queueListener",
      );
      const mockHandler = vi.fn();

      liveChannelCore["attachListener"]("INSERT", mockHandler);

      expect(queueListenerSpy).toHaveBeenCalledWith({
        event: "INSERT",
        handler: mockHandler,
      });
    });

    it("should not call supabaseListen if socket or conduit does not exist", () => {
      const supabaseListenSpy = vi.spyOn(
        liveChannelCore as any,
        "supabaseListen",
      );
      const queueListenerSpy = vi.spyOn(
        liveChannelCore as any,
        "queueListener",
      );
      const mockHandler = vi.fn();

      liveChannelCore["socket"] = null;
      liveChannelCore["attachListener"]("INSERT", mockHandler);
      expect(supabaseListenSpy).not.toHaveBeenCalled();
      expect(queueListenerSpy).not.toHaveBeenCalled();

      liveChannelCore["socket"] = {} as SupabaseChannel;
      liveChannelCore["conduit"] = null;
      liveChannelCore["attachListener"]("INSERT", mockHandler);
      expect(supabaseListenSpy).not.toHaveBeenCalled();
      expect(queueListenerSpy).not.toHaveBeenCalled();
    });
  });

  describe("openConduit", () => {
    it("should call conduit.channel with the channelKey and set the socket", async () => {
      const mockChannel = {
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnThis(),
        unsubscribe: vi.fn().mockResolvedValue(""),
      } as unknown as SupabaseChannel;
      mockSupabase.channel.mockReturnValue(mockChannel);

      await liveChannelCore["openConduit"]();

      expect(mockSupabase.channel).toHaveBeenCalledWith("public:badges");
      expect(liveChannelCore["socket"]).toBe(mockChannel);
    });

    it("should log conduit opening", async () => {
      const mockChannel = {
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnThis(),
        unsubscribe: vi.fn().mockResolvedValue(""),
      } as unknown as SupabaseChannel;
      mockSupabase.channel.mockReturnValue(mockChannel);
      const consoleLogSpy = vi.spyOn(console, "log");

      await liveChannelCore["openConduit"]();
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "LiveChannelCore: Opened conduit 'public:badges'.",
      );
    });

    it("should throw an error if conduit.channel throws an error", async () => {
      const error = new Error("Failed to open channel");
      mockSupabase.channel.mockImplementation(() => {
        throw error;
      });
      const consoleErrorSpy = vi.spyOn(console, "error");

      await expect(liveChannelCore["openConduit"]()).rejects.toThrow(error);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "LiveChannelCore: Failed to open conduit 'public:badges':",
        error,
      );
    });

    it("should not call conduit.channel if socket already exists", async () => {
      const mockChannel = {
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnThis(),
        unsubscribe: vi.fn().mockResolvedValue(""),
      } as unknown as SupabaseChannel;
      mockSupabase.channel.mockReturnValue(mockChannel);
      liveChannelCore["socket"] = mockChannel;

      await liveChannelCore["openConduit"]();

      expect(mockSupabase.channel).not.toHaveBeenCalled();
      expect(liveChannelCore["socket"]).toBe(mockChannel);
    });
  });

  describe("closeConduit", () => {
    it("should unsubscribe from the socket, remove the channel, and set socket to null", async () => {
      const mockSocket = {
        unsubscribe: vi.fn().mockResolvedValue(""),
      } as unknown as SupabaseChannel;
      liveChannelCore["socket"] = mockSocket;

      await liveChannelCore.closeConduit();

      expect(mockSocket.unsubscribe).toHaveBeenCalled();
      expect(mockSupabase.removeChannel).toHaveBeenCalledWith(mockSocket);
      expect(liveChannelCore["socket"]).toBeNull();
      expect(liveChannelCore["isConnected"]).toBe(false);
    });

    it("should log conduit closing", async () => {
      const mockSocket = {
        unsubscribe: vi.fn().mockResolvedValue(""),
      } as unknown as SupabaseChannel;
      liveChannelCore["socket"] = mockSocket;
      const consoleLogSpy = vi.spyOn(console, "log");

      await liveChannelCore.closeConduit();
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "LiveChannelCore: Closed conduit 'public:badges'.",
      );
    });

    it("should handle the case where socket is null", async () => {
      const consoleWarnSpy = vi.spyOn(console, "warn");
      liveChannelCore["socket"] = null;

      await liveChannelCore.closeConduit();

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "LiveChannelCore: No active conduit to close for 'public:badges'.",
      );
    });
  });
});

describe("LiveChannel", () => {
  let liveChannel: LiveChannel<"badges">;

  beforeEach(() => {
    liveChannel = new LiveChannel("badges");
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    it("should set tableName and channelKey", () => {
      expect(liveChannel["tableName"]).toBe("badges");
      expect(liveChannel["channelKey"]).toBe("public:badges");
    });

    it("should initialize activeHandlers as a Map", () => {
      expect(liveChannel["activeHandlers"]).toBeInstanceOf(Map);
    });
  });

  describe("establishConduit", () => {
    it("should call super.establishConduit", () => {
      const superEstablishConduitSpy = vi.spyOn(
        LiveChannelCore.prototype,
        "establishConduit",
      );
      liveChannel.establishConduit();
      expect(superEstablishConduitSpy).toHaveBeenCalled();
    });
  });

  describe("openConduit", () => {
    it("should call super.openConduit", async () => {
      const superOpenConduitSpy = vi.spyOn(
        LiveChannelCore.prototype,
        "openConduit",
      );
      const mockChannel = {
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnThis(),
        unsubscribe: vi.fn().mockResolvedValue(""),
      } as unknown as SupabaseChannel;
      mockSupabase.channel.mockReturnValue(mockChannel);
      await liveChannel.openConduit();
      expect(superOpenConduitSpy).toHaveBeenCalled();
    });
  });

  describe("watch", () => {
    it("should add handler to activeHandlers and call attachListener", () => {
      const attachListenerSpy = vi.spyOn(liveChannel as any, "attachListener");
      const mockHandler = vi.fn();

      liveChannel.watch("INSERT", mockHandler);

      expect(liveChannel["activeHandlers"].get("INSERT")).toContain(
        mockHandler,
      );
      expect(attachListenerSpy).toHaveBeenCalledWith("INSERT", mockHandler);
    });

    it("should not add duplicate handlers for the same event", () => {
      const attachListenerSpy = vi.spyOn(liveChannel as any, "attachListener");
      const mockHandler = vi.fn();

      liveChannel.watch("INSERT", mockHandler);
      liveChannel.watch("INSERT", mockHandler);

      expect(liveChannel["activeHandlers"].get("INSERT")).toEqual([
        mockHandler,
      ]);
      expect(attachListenerSpy).toHaveBeenCalledTimes(1);
    });

    it("should allow adding different handlers for different events", () => {
      const attachListenerSpy = vi.spyOn(liveChannel as any, "attachListener");
      const mockInsertHandler = vi.fn();
      const mockUpdateHandler = vi.fn();

      liveChannel.watch("INSERT", mockInsertHandler);
      liveChannel.watch("UPDATE", mockUpdateHandler);

      expect(liveChannel["activeHandlers"].get("INSERT")).toEqual([
        mockInsertHandler,
      ]);
      expect(liveChannel["activeHandlers"].get("UPDATE")).toEqual([
        mockUpdateHandler,
      ]);
      expect(attachListenerSpy).toHaveBeenCalledTimes(2);
    });

    it("should log a warning when adding a duplicate handler", () => {
      const consoleWarnSpy = vi.spyOn(console, "warn");
      const mockHandler = vi.fn();

      liveChannel.watch("INSERT", mockHandler);
      liveChannel.watch("INSERT", mockHandler);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "LiveChannel: Handler already watching 'INSERT' on 'public:badges'.",
      );
    });
  });
});
