import type { LoginDTO } from "./server";

type CustomNonNullable<T extends Record<string, unknown>> = {
  [K in keyof T]: NonNullable<T[K]>;
};

export type LogoutApiResponse = CustomNonNullable<LoginDTO>;
