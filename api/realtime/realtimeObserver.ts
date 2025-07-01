import useSupabase from "~/api/utils/supabaseInit";
import {
  type ListenEvent,
  type TableName,
  type SubscriptionCallback,
  LiveChannel,
} from "./liveChannel";

/**
 * Represents a record for a channel subscription, including the live channel,
 * event handlers, and subscription status.
 */
interface ChannelSubscriptionRecord<T extends TableName> {
  liveChannel: LiveChannel<T>;
  eventHandlers: Map<ListenEvent, Set<SubscriptionCallback<T>>>;
  hasActiveSubscription: boolean;
}

/**
 * Instruction for subscribing to table events.
 */
interface SubscribeInstruction<T extends TableName> {
  onTable: T;
  forEvents: ListenEvent | ListenEvent[];
  withHandler: SubscriptionCallback<T>;
}

/**
 * Instruction for unsubscribing from table events.
 */
interface UnsubscribeInstruction<T extends TableName> {
  fromTable: T;
  forEvents?: ListenEvent | ListenEvent[];
  withHandler?: SubscriptionCallback<T>;
}

/**
 * Singleton observer for managing realtime subscriptions to database tables.
 */
class RealtimeObserver {
  private static instance: RealtimeObserver;
  private readonly knownChannels = new Map<
    string,
    ChannelSubscriptionRecord<TableName>
  >();

  private readonly initialEventsOfInterest: ListenEvent[] = [
    "UPDATE",
    "DELETE",
    "INSERT",
  ] as const;

  /**
   * Private constructor to enforce singleton pattern.
   */
  private constructor() {}

  /**
   * Returns the singleton instance of RealtimeObserver.
   * @returns The singleton RealtimeObserver.
   */
  public static getMonitor(): RealtimeObserver {
    if (!RealtimeObserver.instance) {
      RealtimeObserver.instance = new RealtimeObserver();
    }
    return RealtimeObserver.instance;
  }

  /**
   * Gets or creates a subscription record for the specified table.
   * @param tableName - The table name to observe.
   * @returns The channel subscription record.
   */
  private getOrCreateSubscription<T extends TableName>(
    tableName: T,
  ): ChannelSubscriptionRecord<T> {
    const channelKey = `public:${tableName}`;
    let record = this.knownChannels.get(channelKey) as
      | ChannelSubscriptionRecord<T>
      | undefined;
    if (record) return record;

    record = {
      liveChannel: new LiveChannel<T>(tableName),
      eventHandlers: new Map(),
      hasActiveSubscription: false,
    };
    this.knownChannels.set(channelKey, record);
    console.log(`RealtimeObserver: Observing table '${tableName}'.`);
    return record;
  }

  /**
   * Subscribes to events on a table with a handler.
   * @param instruction - The subscription instruction.
   */
  public subscribe<T extends TableName>(
    instruction: SubscribeInstruction<T>,
  ): void {
    const record = this.getOrCreateSubscription(instruction.onTable);
    const eventsToListen = Array.isArray(instruction.forEvents)
      ? instruction.forEvents
      : [instruction.forEvents];
    const channelKey = `public:${instruction.onTable}`;

    if (!record.hasActiveSubscription && eventsToListen.length > 0) {
      record.hasActiveSubscription = true;
      record.liveChannel
        .openConduit()
        .then(() => {
          this.initialEventsOfInterest.forEach((event) => {
            let handlers = record.eventHandlers.get(event);
            if (!handlers) {
              handlers = new Set();
              record.eventHandlers.set(event, handlers);
            }
            if (eventsToListen.includes(event)) {
              if (!handlers.has(instruction.withHandler)) {
                handlers.add(instruction.withHandler);
              } else {
                console.warn(
                  `RealtimeObserver: Handler already watching '${event}' on '${channelKey}'.`,
                );
              }
            }
            record.liveChannel.watch(event, (payload) => {
              record.eventHandlers
                .get(event)
                ?.forEach((handler) => handler(payload));
            });
          });
          console.log(
            `RealtimeObserver: Established live updates and initial listeners for '${channelKey}'.`,
          );
          record.liveChannel.establishConduit();
        })
        .catch((error) => {
          console.error(
            `RealtimeObserver: Error during conduit opening for '${channelKey}':`,
            error,
          );
        });
    } else {
      eventsToListen.forEach((event) => {
        let handlers = record.eventHandlers.get(event);
        if (!handlers) {
          handlers = new Set();
          record.eventHandlers.set(event, handlers);
        }
        if (!handlers.has(instruction.withHandler)) {
          handlers.add(instruction.withHandler);
        } else {
          console.warn(
            `RealtimeObserver: Handler already watching '${event}' on '${channelKey}'.`,
          );
        }
      });
    }
  }

  /**
   * Unsubscribes a handler or all handlers from events on a table.
   * @param instruction - The unsubscribe instruction.
   */
  public async unsubscribe<T extends TableName>(
    instruction: UnsubscribeInstruction<T>,
  ): Promise<void> {
    const channelKey = `public:${instruction.fromTable}`;
    const record = this.knownChannels.get(channelKey) as
      | ChannelSubscriptionRecord<T>
      | undefined;

    if (!record) {
      console.warn(
        `RealtimeObserver: Cannot unobserve '${channelKey}', not being monitored.`,
      );
      return;
    }

    if (instruction.forEvents) {
      const eventsToUnsubscribe = Array.isArray(instruction.forEvents)
        ? instruction.forEvents
        : [instruction.forEvents];

      eventsToUnsubscribe.forEach((event) => {
        const handlers = record.eventHandlers.get(event);
        if (handlers && instruction.withHandler) {
          handlers.delete(instruction.withHandler);
          if (handlers.size === 0) {
            record.eventHandlers.delete(event);
          }
          console.warn(
            `RealtimeObserver: Single handler unwatching for '${event}' on '${channelKey}'. Consider unwatching all.`,
          );
        } else if (handlers) {
          record.eventHandlers.delete(event);
        }
      });

      if (record.eventHandlers.size === 0 && record.hasActiveSubscription) {
        this.knownChannels.delete(channelKey);
      }
    } else {
      this.knownChannels.delete(channelKey);
    }
  }

  public async unsubscribeToAll(): Promise<void> {
    try {
      await useSupabase().removeAllChannels();
      this.knownChannels.clear();
      console.warn(
        "RealtimeObserver: Closure of all the conduits have been done!!",
      );
    } catch (error) {
      console.error("RealtimeObserver: Error during unsubscribeToAll:", error);
    }
  }
}

export const realtimeObserver = RealtimeObserver.getMonitor();
