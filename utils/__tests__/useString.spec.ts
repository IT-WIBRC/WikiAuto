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

  describe("isEmpty", () => {
    it("should return true when the text provided is empty", () => {
      expect(useString.isEmpty("")).toBe(true);
    });

    it("should return false when the text provided is not empty", () => {
      expect(useString.isEmpty("Description")).toBe(false);
    });
  });

  describe("isLessThan", () => {
    it("should return true when the text provided is less than `characterLength` provided", () => {
      expect(useString.isLessThan("Text provides", 20)).toBe(true);
    });

    it("should return false when the text provided is more than `characterLength` provided", () => {
      expect(useString.isLessThan("Description", "4")).toBe(false);
    });
  });

  describe("isMoreThan", () => {
    it("should return true when the text provided is more than `characterLength` provided", () => {
      expect(useString.isMoreThan("Provided one", "5")).toBe(true);
    });

    it("should return false when the text provided is less than `characterLength` provided", () => {
      expect(useString.isMoreThan("Description", 20)).toBe(false);
    });
  });
});
