export default {
  toCapitalize: (word: string): string => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  },
  substituteSpacesBy: (text: string, substitute = ""): string => {
    return text.replace(/\s/g, substitute);
  },
  toPre: function (text: string): string {
    return this.substituteSpacesBy(text).toLowerCase();
  },
  isEmpty: function (text: string): boolean {
    return this.substituteSpacesBy(text).length < 1;
  },
  isLessThan: function (text: string, characterLength: number): boolean {
    return this.substituteSpacesBy(text).length < characterLength;
  },
  isMoreThan: function (text: string, characterLength: number): boolean {
    return this.substituteSpacesBy(text).length > characterLength;
  },
};
