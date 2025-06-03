import useSupabase from "~/api/supabaseInit";
import type { SupabaseChannel } from "~/api/types";
import type { Database, Tables } from "~/api/wikiAutoType";
import type {
  RealtimePostgresChangesPayload,
  RealtimeChannel,
  REALTIME_POSTGRES_CHANGES_LISTEN_EVENT,
} from "@supabase/supabase-js";

export type ListenEvent = Exclude<
  `${REALTIME_POSTGRES_CHANGES_LISTEN_EVENT}`,
  "*"
>;

export type TableName = keyof Database["public"]["Tables"];
type ChannelPayload<T extends TableName> = RealtimePostgresChangesPayload<
  Tables<T>
>;

export type SubscriptionCallback<T extends TableName> = (
  payload: ChannelPayload<T>,
) => void;

export class LiveChannelCore<T extends TableName> {
  protected socket: SupabaseChannel | null = null;
  protected readonly conduit = useSupabase();
  protected readonly tableName: T;
  protected readonly channelKey: string;
  protected awaitingConnection: {
    event: ListenEvent;
    handler: SubscriptionCallback<T>;
  }[] = [];

  protected isConnected: boolean = false;

  constructor(tableName: T) {
    this.tableName = tableName;
    this.channelKey = `public:${tableName}`;
  }

  protected onConnectionEstablished = (): void => {
    console.log(`LiveChannelCore: Conduit '${this.channelKey}' SUBSCRIBED`);
    this.attachQueuedListeners();
  };

  protected onConnectionLost = (status: string): void => {
    this.isConnected = false;
    console.error(
      `LiveChannelCore: Conduit '${this.channelKey}' status: ${status}`,
    );
    this.clearQueuedListeners();
  };

  protected monitorConnectionStatus = (status: string): void => {
    if (status === "SUBSCRIBED") {
      this.onConnectionEstablished();
    } else if (["ERROR", "CLOSED", "TIMED_OUT"].includes(status)) {
      this.onConnectionLost(status);
    }
  };

  protected attachQueuedListeners(): void {
    this.awaitingConnection.forEach((listener) =>
      this.attachListener(listener.event, listener.handler),
    );
    this.clearQueuedListeners();
  }

  protected clearQueuedListeners(): void {
    this.awaitingConnection = [];
  }

  protected queueListener(listener: {
    event: ListenEvent;
    handler: SubscriptionCallback<T>;
  }): void {
    if (!this.isListenerQueued(listener)) {
      this.awaitingConnection.push(listener);
      console.warn(
        `LiveChannelCore: Listener for '${listener.event}' pending connection on '${this.channelKey}'.`,
      );
    } else {
      console.warn(
        `LiveChannelCore: Listener for '${listener.event}' already pending on '${this.channelKey}'.`,
      );
    }
  }

  protected isListenerQueued(listener: {
    event: ListenEvent;
    handler: SubscriptionCallback<T>;
  }): boolean {
    return this.awaitingConnection.some(
      (queued) =>
        queued.event === listener.event && queued.handler === listener.handler,
    );
  }

  /**
   * Attempts to attach a listener for a specific event using Supabase's channel API.
   * @param event - The event type to listen for ("INSERT", "UPDATE", "DELETE").
   * @param handler - The callback to invoke when the event occurs.
   * @returns The RealtimeChannel if successful, otherwise null.
   */
  protected supabaseListen(
    event: ListenEvent,
    handler: SubscriptionCallback<T>,
  ): RealtimeChannel | null {
    try {
      return this.socket!.on(
        "postgres_changes",
        {
          schema: "public",
          event,
          table: this.tableName,
        },
        handler,
      );
    } catch (error) {
      console.error(
        `LiveChannelCore: Failed to attach listener for '${event}' on '${this.channelKey}':`,
        error,
      );
      return null;
    }
  }

  /**
   * Establishes the conduit by subscribing to the socket and monitoring connection status.
   */
  protected establishConduit(): void {
    if (this.socket && !this.isConnected) {
      this.socket.subscribe(this.monitorConnectionStatus.bind(this));
      this.isConnected = true;
      console.log(`LiveChannelCore: Established conduit '${this.channelKey}'.`);
    }
  }

  /**
   * Attaches a listener for a specific event, validating event and handler.
   * Queues the listener if the conduit is not ready.
   * @param event - The event type to listen for.
   * @param handler - The callback to invoke when the event occurs.
   */
  protected attachListener(
    event: ListenEvent,
    handler: SubscriptionCallback<T>,
  ): void {
    const validEvents: ListenEvent[] = ["INSERT", "UPDATE", "DELETE"];
    if (!validEvents.includes(event)) {
      console.warn(
        `LiveChannelCore: Invalid event '${event}' for '${this.channelKey}'.`,
      );
      return;
    }

    if (typeof handler !== "function") {
      console.warn(
        `LiveChannelCore: Handler for '${event}' on '${this.channelKey}' is not a function.`,
      );
      return;
    }

    if (!this.socket || !this.conduit) {
      console.warn(
        `LiveChannelCore: Cannot attach listener for '${event}', conduit not ready for '${this.channelKey}'.`,
      );
      return;
    }

    const onMethod = this.supabaseListen(event, handler);
    if (!onMethod) {
      this.queueListener({
        event,
        handler,
      });
    }
  }

  /**
   * Opens the conduit (channel) if not already open.
   * @throws If the conduit is not initialized.
   */
  protected async openConduit(): Promise<void> {
    if (!this.conduit) {
      throw new Error(
        `LiveChannelCore: 'conduit' is not initialized for '${this.channelKey}'.`,
      );
    }
    if (!this.socket) {
      try {
        this.socket = this.conduit.channel(this.channelKey);
        console.log(`LiveChannelCore: Opened conduit '${this.channelKey}'.`);
      } catch (error) {
        console.error(
          `LiveChannelCore: Failed to open conduit '${this.channelKey}':`,
          error,
        );
        throw error;
      }
    }
  }

  /**
   * Closes the conduit, unsubscribes from the socket, and removes the channel.
   */
  public async closeConduit(): Promise<void> {
    try {
      this.clearQueuedListeners();
      this.isConnected = false;
      if (this.socket && this.conduit) {
        await this.socket.unsubscribe();
        this.conduit.removeChannel(this.socket);
        this.socket = null;
        console.log(`LiveChannelCore: Closed conduit '${this.channelKey}'.`);
      } else {
        console.warn(
          `LiveChannelCore: No active conduit to close for '${this.channelKey}'.`,
        );
      }
    } catch (error) {
      console.error(
        `LiveChannelCore: Error closing conduit '${this.channelKey}':`,
        error,
      );
    }
  }
}

export class LiveChannel<T extends TableName> extends LiveChannelCore<T> {
  private readonly activeHandlers: Map<ListenEvent, SubscriptionCallback<T>[]> =
    new Map();

  /**
   * Creates a new LiveChannel for the specified table.
   * @param tableName - The table name to observe.
   */
  public constructor(tableName: T) {
    super(tableName);
  }

  /**
   * Establishes the conduit by subscribing to the socket and monitoring connection status.
   * (Overrides base method for public access.)
   */
  public override establishConduit(): void {
    super.establishConduit();
  }

  /**
   * Opens the conduit (channel) if not already open.
   * (Overrides base method for public access.)
   * @returns A promise that resolves when the conduit is open.
   */
  public override openConduit(): Promise<void> {
    return super.openConduit();
  }

  /**
   * Registers a handler for a specific event on this channel.
   * If the handler is already registered, logs a warning.
   * @param event - The event type to listen for.
   * @param handler - The callback to invoke when the event occurs.
   */
  public watch(event: ListenEvent, handler: SubscriptionCallback<T>): void {
    const handlers = this.activeHandlers.get(event) || [];
    if (!handlers.includes(handler)) {
      handlers.push(handler);
      this.activeHandlers.set(event, handlers);
      this.attachListener(event, handler);
    } else {
      console.warn(
        `LiveChannel: Handler already watching '${event}' on '${this.channelKey}'.`,
      );
    }
  }
}
