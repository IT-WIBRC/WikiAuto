import type { Tables } from "../../server/types/db";

export type Badge = Tables<"badges">;
export type GetBadgeListTypeForOption = Omit<
  Badge,
  "description" | "created_at" | "updated_at"
>;
