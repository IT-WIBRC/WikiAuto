import type { LoginPayloadData } from "./server";

type CustomNonNullable<T extends Record<string, unknown>> = {
    [K in keyof T]: NonNullable<T[K]>;
};

export type LoginApiRawResponse = CustomNonNullable<LoginPayloadData>;
export type LogoutApiRawResponse = CustomNonNullable<LoginPayloadData>;
