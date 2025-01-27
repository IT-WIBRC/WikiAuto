import { describe, expect, it } from "vitest";
import useString from "../useString";

describe("UseString", () => {
  describe("toCapitalize", () => {
    it("should return the capitalized word when the word is all in lowercase", () => {
      expect(useString.toCapitalize("word")).toBe("Word");
    });

    it("should return the capitalized word when the word is all in uppercase", () => {
      expect(useString.toCapitalize("WORD")).toBe("Word");
    });

    it("should return the capitalized word when the word is in both uppercase and lowercase", () => {
      expect(useString.toCapitalize("WOrd")).toBe("Word");
    });

    it("should return the capitalized word when it is already in uppercase", () => {
      expect(useString.toCapitalize("Word")).toBe("Word");
    });
  });

  describe("substituteSpacesBy", () => {
    it("should return the text with the spaces removed by default", () => {
      expect(useString.substituteSpacesBy("My name is   Rayn", "")).toBe(
        "MynameisRayn",
      );
    });

    it("should return the text with the space substitute with the given one (-)", () => {
      expect(useString.substituteSpacesBy("My name is   Rayn", "-")).toBe(
        "My-name-is---Rayn",
      );
    });
  });

  describe("toPre", () => {
    it("should return the text without any space and in lowercase", () => {
      expect(useString.toPre("My name is   Rayn ", "")).toBe("mynameisrayn");
    });
  });
});
