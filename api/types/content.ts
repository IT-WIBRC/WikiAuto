import type { Tables } from "./db";
import type { Badge } from "./badge";

export const CONTENT_STATUS = {
  PENDING: "PENDING",
  VALIDATED: "VALIDATED",
  DRAFT: "DRAFT",
} as const;

export const CONTENT_RESPONSE_STATUS = {
  completed: "completed",
  incomplete: "incomplete",
  failed: "failed",
} as const;

export type Content = Tables<"contents">;

export type ContentCreation = {
  title: string;
  explanation: string;
  illustration: File;
  badges: Badge[];
  status: keyof typeof CONTENT_STATUS;
};

export type ContentEdition = {
  id: string;
  userEmail: string;
} & ContentCreation;

export type GetContentListItem = (Content & {
  badges: Pick<Badge, "badge_id" | "description" | "name">[];
})[];

export type GetContentDetailsType = Tables<"contents"> & {
  badges: Tables<"badges">[];
};
