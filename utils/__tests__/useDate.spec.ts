import { describe, expect, it } from "vitest";
import useDate from "../useDate";

describe("useDate", () => {
  describe("difference", () => {
    it("should return a positive value when the first date is after the second date", () => {
      expect(useDate.difference("2024-12-16 18:45:28", "2024-12-14 18:45:28") > 0).toBe(true);
    });

    it("should return a negative value when the second date is after the first date", () => {
      expect(useDate.difference("2024-12-14 18:45:28", "2024-12-18 18:45:28") > 0).toBe(false);
    });

    it("should return 0  when the first date is equal to the second date", () => {
      expect(useDate.difference("2024-12-14 18:45:28", "2024-12-14 18:45:28") === 0).toBe(true);
    });
  });
});
