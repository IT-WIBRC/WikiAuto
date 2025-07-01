import type { Badge as BadgeType } from "~/api";
import useString from "~/utils/useString";

export interface CustomOption<T> {
  get displayedValue(): string;
  get selectedValue(): T;
  get identifier(): string | number;
}

class BadgeToOption implements CustomOption<BadgeType> {
  constructor(private badge: BadgeType) {}

  get displayedValue(): string {
    return this.badge.name;
  }

  get selectedValue(): BadgeType {
    return this.badge;
  }

  get identifier(): string {
    return this.badge.badge_id;
  }
}

export class BadgeToOptionForList extends BadgeToOption {
  constructor(
    private badge: BadgeType,
    private selectedBadgeList: BadgeToOption[],
  ) {
    super(badge);
  }

  get isSelected(): boolean {
    return !!this.selectedBadgeList.find(
      (element) =>
        useString.toPre(this.badge.name ?? "") ===
        useString.toPre(element.displayedValue ?? ""),
    );
  }
}
