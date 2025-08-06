import type { Tables } from "../../shared/types/database.types";

export type Badge = Tables<"badges">;
export type GetBadgeListTypeForOption = Omit<
  Badge,
  "description" | "created_at" | "updated_at"
>;
