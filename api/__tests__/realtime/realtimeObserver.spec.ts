/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { realtimeObserver } from "../../realtime/realtimeObserver";
import { LiveChannel } from "../../realtime/liveChannel";
import type {
  TableName,
  SubscriptionCallback,
} from "../../realtime/liveChannel";
import useUnitTestUtils from "~/tests/utils/ui";

const removeAllChannels = vi.fn().mockResolvedValue(undefined);

vi.mock("~/api/utils/supabaseInit", () => ({
  default: () => ({
    channel: vi.fn().mockReturnValue({
      subscribe: vi.fn(),
      on: vi.fn().mockReturnThis(),
      unsubscribe: vi.fn().mockResolvedValue(undefined),
    }),
    removeAllChannels,
    removeChannel: vi.fn(),
  }),
}));

vi.mock("../../realtime/liveChannel", () => {
  class LiveChannelMock {
    tableName: TableName;
    constructor(tableName: TableName) {
      this.tableName = tableName;
    }

    openConduit() {
      return Promise.resolve(undefined);
    }

    establishConduit() {}
    watch() {}
    closeConduit() {
      return Promise.resolve(undefined);
    }
  }
  return { LiveChannel: LiveChannelMock };
});

describe("realtimeObserver", () => {
  let observer: typeof realtimeObserver;

  beforeEach(() => {
    observer = realtimeObserver;
    vi.clearAllMocks();
  });

  afterEach(() => {
    (observer as any).knownChannels.clear();
  });

  it("should be a singleton", () => {
    const observer2 = realtimeObserver;
    expect(observer).toBe(observer2);
  });

  it("should not add the same handler twice for the same event", () => {
    const handler = vi.fn() as SubscriptionCallback<"contents">;
    observer.subscribe({
      onTable: "contents",
      forEvents: "INSERT",
      withHandler: handler,
    });
    observer.subscribe({
      onTable: "contents",
      forEvents: "INSERT",
      withHandler: handler,
    });

    const knownChannels = (observer as any).knownChannels;
    const record = knownChannels.get("public:contents");
    const handlers = Array.from(record.eventHandlers.get("INSERT"));
    expect(handlers.filter((h) => h === handler).length).toBe(1);
  });

  describe("subscribe", () => {
    it("should create a new subscription record if one does not exist", async () => {
      const handler = vi.fn() as SubscriptionCallback<"contents">;
      observer.subscribe({
        onTable: "contents",
        forEvents: "INSERT",
        withHandler: handler,
      });

      await useUnitTestUtils.flushPromises();

      const knownChannels = (observer as any).knownChannels;
      expect(knownChannels.has("public:contents")).toBe(true);
      const record = knownChannels.get("public:contents");
      expect(record.liveChannel).toBeInstanceOf(LiveChannel);
      expect(record.eventHandlers.get("INSERT")).toContain(handler);
      expect(record.hasActiveSubscription).toBe(true);
    });

    it("should add handler to existing subscription record", async () => {
      const handler1 = vi.fn() as SubscriptionCallback<"contents">;
      const handler2 = vi.fn() as SubscriptionCallback<"contents">;

      observer.subscribe({
        onTable: "contents",
        forEvents: "INSERT",
        withHandler: handler1,
      });

      observer.subscribe({
        onTable: "contents",
        forEvents: "INSERT",
        withHandler: handler2,
      });

      await useUnitTestUtils.flushPromises();

      const knownChannels = (observer as any).knownChannels;
      const record = knownChannels.get("public:contents");
      expect(record.eventHandlers.get("INSERT")).toContain(handler1);
      expect(record.eventHandlers.get("INSERT")).toContain(handler2);
    });

    it("should call openConduit and establishConduit when first handler is added", async () => {
      const handler = vi.fn() as SubscriptionCallback<"contents">;
      const liveChannelOpenConduitSpy = vi.spyOn(
        LiveChannel.prototype,
        "openConduit",
      );
      const liveChannelEstablishConduitSpy = vi.spyOn(
        LiveChannel.prototype,
        "establishConduit",
      );

      observer.subscribe({
        onTable: "contents",
        forEvents: "INSERT",
        withHandler: handler,
      });

      expect(liveChannelOpenConduitSpy).toHaveBeenCalled();
      await useUnitTestUtils.flushPromises();
      expect(liveChannelEstablishConduitSpy).toHaveBeenCalled();
    });

    it("should call watch with the handler", async () => {
      const handler = vi.fn() as SubscriptionCallback<"contents">;
      const liveChannelWatchSpy = vi.spyOn(LiveChannel.prototype, "watch");

      observer.subscribe({
        onTable: "contents",
        forEvents: "INSERT",
        withHandler: handler,
      });
      await useUnitTestUtils.flushPromises();

      expect(liveChannelWatchSpy).toHaveBeenCalledWith(
        "INSERT",
        expect.any(Function),
      );
    });

    it("should handle multiple events", async () => {
      const handler = vi.fn() as SubscriptionCallback<"contents">;
      const liveChannelWatchSpy = vi.spyOn(LiveChannel.prototype, "watch");

      observer.subscribe({
        onTable: "contents",
        forEvents: ["INSERT", "UPDATE"],
        withHandler: handler,
      });
      await useUnitTestUtils.flushPromises();
      expect(liveChannelWatchSpy).toHaveBeenCalledWith(
        "INSERT",
        expect.any(Function),
      );
      expect(liveChannelWatchSpy).toHaveBeenCalledWith(
        "UPDATE",
        expect.any(Function),
      );
    });

    it("should log a warning when adding a duplicate handler", async () => {
      const handler = vi.fn() as SubscriptionCallback<"contents">;
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      observer.subscribe({
        onTable: "contents",
        forEvents: "INSERT",
        withHandler: handler,
      });
      observer.subscribe({
        onTable: "contents",
        forEvents: "INSERT",
        withHandler: handler,
      });

      await useUnitTestUtils.flushPromises();

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Handler already watching"),
      );
      warnSpy.mockRestore();
    });

    it("should handle multiple handlers for multiple events", async () => {
      const handler1 = vi.fn() as SubscriptionCallback<"contents">;
      const handler2 = vi.fn() as SubscriptionCallback<"contents">;

      observer.subscribe({
        onTable: "contents",
        forEvents: ["INSERT", "UPDATE"],
        withHandler: handler1,
      });
      observer.subscribe({
        onTable: "contents",
        forEvents: ["INSERT", "UPDATE"],
        withHandler: handler2,
      });

      await useUnitTestUtils.flushPromises();

      const knownChannels = (observer as any).knownChannels;
      const record = knownChannels.get("public:contents");
      expect(record.eventHandlers.get("INSERT")).toContain(handler1);
      expect(record.eventHandlers.get("INSERT")).toContain(handler2);
      expect(record.eventHandlers.get("UPDATE")).toContain(handler1);
      expect(record.eventHandlers.get("UPDATE")).toContain(handler2);
    });
  });

  describe("unsubscribe", () => {
    it("should remove a handler from a subscription", async () => {
      const handler1 = vi.fn() as SubscriptionCallback<"contents">;
      const handler2 = vi.fn() as SubscriptionCallback<"contents">;

      observer.subscribe({
        onTable: "contents",
        forEvents: "INSERT",
        withHandler: handler1,
      });
      observer.subscribe({
        onTable: "contents",
        forEvents: "INSERT",
        withHandler: handler2,
      });

      await useUnitTestUtils.flushPromises();

      await observer.unsubscribe({
        fromTable: "contents",
        forEvents: "INSERT",
        withHandler: handler1,
      });

      const knownChannels = (observer as any).knownChannels;
      const record = knownChannels.get("public:contents");
      expect(record.eventHandlers.get("INSERT")).not.toContain(handler1);
      expect(record.eventHandlers.get("INSERT")).toContain(handler2);
    });

    it("should remove the event if there are no more handlers", async () => {
      const handler = vi.fn() as SubscriptionCallback<"contents">;

      observer.subscribe({
        onTable: "contents",
        forEvents: "INSERT",
        withHandler: handler,
      });

      await useUnitTestUtils.flushPromises();

      await observer.unsubscribe({
        fromTable: "contents",
        forEvents: "INSERT",
        withHandler: handler,
      });

      const knownChannels = (observer as any).knownChannels;
      const record = knownChannels.get("public:contents");
      expect(record.eventHandlers.has("INSERT")).toBe(false);
    });

    it("should remove the subscription record if there are no more events", async () => {
      const handler = vi.fn() as SubscriptionCallback<"contents">;

      observer.subscribe({
        onTable: "contents",
        forEvents: "INSERT",
        withHandler: handler,
      });

      await observer.unsubscribe({
        fromTable: "contents",
        forEvents: "INSERT",
        withHandler: handler,
      });

      const knownChannels = (observer as any).knownChannels;
      expect(knownChannels.has("public:contents")).toBe(false);
    });

    it("should call delete if forEvents is not provided", async () => {
      const handler = vi.fn() as SubscriptionCallback<"contents">;
      observer.subscribe({
        onTable: "contents",
        forEvents: "INSERT",
        withHandler: handler,
      });
      await observer.unsubscribe({ fromTable: "contents" });
      const knownChannels = (observer as any).knownChannels;
      expect(knownChannels.has("public:contents")).toBe(false);
    });

    it("should not throw when unsubscribing an event with no handlers", async () => {
      observer.subscribe({
        onTable: "contents",
        forEvents: "INSERT",
        withHandler: vi.fn() as SubscriptionCallback<"contents">,
      });
      await expect(
        observer.unsubscribe({
          fromTable: "contents",
          forEvents: "UPDATE",
          withHandler: vi.fn() as SubscriptionCallback<"contents">,
        }),
      ).resolves.not.toThrow();
    });

    it("should not throw when unsubscribing from a non-existent record", async () => {
      await expect(
        observer.unsubscribe({
          fromTable: "nonexistent",
          forEvents: "INSERT",
          withHandler: vi.fn() as SubscriptionCallback<"contents">,
        }),
      ).resolves.not.toThrow();
    });
  });

  describe("unsubscribeToAll", () => {
    it("should call removeAllChannels on the Supabase client", async () => {
      await observer.unsubscribeToAll();
      expect(removeAllChannels).toHaveBeenCalledTimes(1);
    });

    it("should clear all known channels", async () => {
      const handler = vi.fn() as SubscriptionCallback<"contents">;
      observer.subscribe({
        onTable: "contents",
        forEvents: "INSERT",
        withHandler: handler,
      });

      await observer.unsubscribeToAll();

      const knownChannels = (observer as any).knownChannels;
      expect(knownChannels.size).toBe(0);
    });
  });
});
