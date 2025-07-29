import type {
  AuthResponse as SupabaseAuthResponse,
  AuthTokenResponsePassword as SupabaseAuthTokenResponsePassword,
  PostgrestResponse as SupabasePostgrestResponse,
  PostgrestSingleResponse as SupabasePostgrestSingleResponse,
  SupabaseClient as ConcreteSupabaseClient,
} from "@supabase/supabase-js";
import type { Tables } from "./database.types";

/**
 * Represents the general result of an authentication operation (e.g., sign-up, sign-in, session refresh).
 * Provides user and session data or an error, abstracted from provider specifics.
 */
export type AuthenticationResult = SupabaseAuthResponse;

/**
 * Represents the specific result of a password-based login operation.
 * Provides user and session data along with an access token, or an error, abstracted from provider specifics.
 */
export type LoginResult = SupabaseAuthTokenResponsePassword;

/**
 * Represents the response from a database query that might return multiple records.
 * The generic type 'T' defines the structure of a single record, abstracted from provider specifics.
 */
export type QueryResult<T> = SupabasePostgrestResponse<T>;

/**
 * Represents the response from a database query that is expected to return a single record.
 * The generic type 'T' defines the structure of the single record, abstracted from provider specifics.
 */
export type SingleResult<T> = SupabasePostgrestSingleResponse<T>;

/**
 * Interface for the database client, providing methods for authentication and data access.
 * This interface abstracts the Supabase client to allow for easier testing and mocking.
 */
export type DatabaseClientInterface = ConcreteSupabaseClient;

export type GetProfile = Tables<"profile">;

type ProfileDataInfo = Required<GetProfile>;

export type EditProfileInfoPayload = {
  user_id: ProfileDataInfo["user_id"];
} & Partial<Omit<ProfileDataInfo, "user_id" | "email">>;
