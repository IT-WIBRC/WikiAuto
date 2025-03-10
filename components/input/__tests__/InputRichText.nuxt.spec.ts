import { mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeAll, describe, expect, it } from "vitest";
import {
  IconEditorBold,
  IconEditorBulletList,
  IconEditorCenter,
  IconEditorColor,
  IconEditorHeading1,
  IconEditorHeading2,
  IconEditorHeading3,
  IconEditorHeading4,
  IconEditorHeading5,
  IconEditorHeading6,
  IconEditorHighlight,
  IconEditorHorizontalRule,
  IconEditorItalic,
  IconEditorJustify,
  IconEditorLeft,
  IconEditorOrderedList,
  IconEditorRedo,
  IconEditorRight,
  IconEditorStrike,
  IconEditorUnderline,
  IconEditorUndo,
  InputRichText,
} from "#components";
import type { VueWrapper } from "@vue/test-utils";

describe("InputRichText", () => {
  let inputRichTextWrapperText: VueWrapper;
  beforeAll(async () => {
    inputRichTextWrapperText = await mountSuspended(InputRichText, {
      props: {
        label: "Text",
        placeholder: "Enter your text",
        isRequired: false,
        modelValue: "",
      },
      global: {
        stubs: ["EditorContent"],
      },
    });
  });

  it("should render correctly", () => {
    expect(inputRichTextWrapperText.exists()).toBe(true);
  });

  it("should display the placeholder", async () => {
    const customInputRichTextWrapperText = await mountSuspended(InputRichText, {
      props: {
        label: "Text",
        placeholder: "Enter your text",
        isRequired: false,
        modelValue: "",
      },
    });
    expect(
      customInputRichTextWrapperText.findAll("p.is-editor-empty")[0].element
        .dataset.placeholder,
    ).toBe("Enter your text");
  });

  it("should render the editor content", () => {
    expect(
      inputRichTextWrapperText.findComponent("editor-content-stub").exists(),
    ).toBe(true);
  });

  it("should display the label with the wildcard when required", async () => {
    expect(inputRichTextWrapperText.find("label").text()).toBe("Text");

    const customInputRichTextWrapperText = await mountSuspended(InputRichText, {
      props: {
        label: "Text",
        placeholder: "Enter your text",
        isRequired: true,
        modelValue: "",
      },
    });
    expect(customInputRichTextWrapperText.find("label").text()).toBe("Text *");
  });

  it("should display the label", () => {
    expect(inputRichTextWrapperText.find("label").text()).toBe("Text");
  });

  it("should display the `*` when the field is required", async () => {
    inputRichTextWrapperText = await mountSuspended(InputRichText, {
      props: {
        label: "Text",
        placeholder: "Enter your text",
        isRequired: false,
        modelValue: "",
      },
    });
    let wildcards = inputRichTextWrapperText.find("[data-test='wildcard']");
    expect(wildcards.exists()).toBe(false);
    await inputRichTextWrapperText.setProps({
      isRequired: true,
    });
    wildcards = inputRichTextWrapperText.find("[data-test='wildcard']");
    expect(wildcards.exists()).toBe(true);
    expect(wildcards.text()).toBe("*");
  });

  describe("Actions Button", () => {
    it("should render the bold button", () => {
      const boldBtn = inputRichTextWrapperText.find("[data-test='bold']");
      expect(boldBtn.exists()).toBe(true);
      expect(boldBtn.findComponent(IconEditorBold).exists()).toBe(true);
    });

    it("should render the italic button", () => {
      const italicBtn = inputRichTextWrapperText.find("[data-test='italic']");
      expect(italicBtn.exists()).toBe(true);
      expect(italicBtn.findComponent(IconEditorItalic).exists()).toBe(true);
    });

    it("should render the underline button", () => {
      const underlineBtn = inputRichTextWrapperText.find(
        "[data-test='underline']",
      );
      expect(underlineBtn.exists()).toBe(true);
      expect(underlineBtn.findComponent(IconEditorUnderline).exists()).toBe(
        true,
      );
    });

    it("should render the strike button", () => {
      const strikeBtn = inputRichTextWrapperText.find("[data-test='strike']");
      expect(strikeBtn.exists()).toBe(true);
      expect(strikeBtn.findComponent(IconEditorStrike).exists()).toBe(true);
    });

    describe("Heading", () => {
      it("should render the heading 1 button", () => {
        const heading1Btn = inputRichTextWrapperText.find(
          "[data-test='heading1']",
        );
        expect(heading1Btn.exists()).toBe(true);
        expect(heading1Btn.findComponent(IconEditorHeading1).exists()).toBe(
          true,
        );
      });

      it("should render the heading 2 button", () => {
        const heading2Btn = inputRichTextWrapperText.find(
          "[data-test='heading2']",
        );
        expect(heading2Btn.exists()).toBe(true);
        expect(heading2Btn.findComponent(IconEditorHeading2).exists()).toBe(
          true,
        );
      });

      it("should render the heading 3 button", () => {
        const heading3Btn = inputRichTextWrapperText.find(
          "[data-test='heading3']",
        );
        expect(heading3Btn.exists()).toBe(true);
        expect(heading3Btn.findComponent(IconEditorHeading3).exists()).toBe(
          true,
        );
      });

      it("should render the heading 4 button", () => {
        const heading4Btn = inputRichTextWrapperText.find(
          "[data-test='heading4']",
        );
        expect(heading4Btn.exists()).toBe(true);
        expect(heading4Btn.findComponent(IconEditorHeading4).exists()).toBe(
          true,
        );
      });

      it("should render the heading 5 button", () => {
        const heading5Btn = inputRichTextWrapperText.find(
          "[data-test='heading5']",
        );
        expect(heading5Btn.exists()).toBe(true);
        expect(heading5Btn.findComponent(IconEditorHeading5).exists()).toBe(
          true,
        );
      });

      it("should render the heading 6 button", () => {
        const heading6Btn = inputRichTextWrapperText.find(
          "[data-test='heading6']",
        );
        expect(heading6Btn.exists()).toBe(true);
        expect(heading6Btn.findComponent(IconEditorHeading6).exists()).toBe(
          true,
        );
      });
    });

    it("should render the highlight button", () => {
      const highlightBtn = inputRichTextWrapperText.find(
        "[data-test='highlight']",
      );
      expect(highlightBtn.exists()).toBe(true);
      expect(highlightBtn.findComponent(IconEditorHighlight).exists()).toBe(
        true,
      );
    });

    describe("Positions", () => {
      it("should render the button to center the text", () => {
        const centerBtn = inputRichTextWrapperText.find("[data-test='center']");
        expect(centerBtn.exists()).toBe(true);
        expect(centerBtn.findComponent(IconEditorCenter).exists()).toBe(true);
      });

      it("should render the button to make the text left", () => {
        const leftBtn = inputRichTextWrapperText.find("[data-test='left']");
        expect(leftBtn.exists()).toBe(true);
        expect(leftBtn.findComponent(IconEditorLeft).exists()).toBe(true);
      });

      it("should render the button to make the text right", () => {
        const rightBtn = inputRichTextWrapperText.find("[data-test='right']");
        expect(rightBtn.exists()).toBe(true);
        expect(rightBtn.findComponent(IconEditorRight).exists()).toBe(true);
      });

      it("should render the button to justify the text", () => {
        const justifyBtn = inputRichTextWrapperText.find(
          "[data-test='justify']",
        );
        expect(justifyBtn.exists()).toBe(true);
        expect(justifyBtn.findComponent(IconEditorJustify).exists()).toBe(true);
      });
    });

    it("should render the bullet list button", () => {
      const bulletListBtn = inputRichTextWrapperText.find(
        "[data-test='bulletList']",
      );
      expect(bulletListBtn.exists()).toBe(true);
      expect(bulletListBtn.findComponent(IconEditorBulletList).exists()).toBe(
        true,
      );
    });

    it("should render the ordered list button", () => {
      const orderedListBtn = inputRichTextWrapperText.find(
        "[data-test='orderedList']",
      );
      expect(orderedListBtn.exists()).toBe(true);
      expect(orderedListBtn.findComponent(IconEditorOrderedList).exists()).toBe(
        true,
      );
    });

    it("should render the horizontal rule button", () => {
      const horizontalRuleBtn = inputRichTextWrapperText.find(
        "[data-test='horizontalRule']",
      );
      expect(horizontalRuleBtn.exists()).toBe(true);
      expect(
        horizontalRuleBtn.findComponent(IconEditorHorizontalRule).exists(),
      ).toBe(true);
    });

    it("should render the undo button", () => {
      const undoBtn = inputRichTextWrapperText.find("[data-test='undo']");
      expect(undoBtn.exists()).toBe(true);
      expect(undoBtn.findComponent(IconEditorUndo).exists()).toBe(true);
    });

    it("should render the redo button", () => {
      const redoBtn = inputRichTextWrapperText.find("[data-test='redo']");
      expect(redoBtn.exists()).toBe(true);
      expect(redoBtn.findComponent(IconEditorRedo).exists()).toBe(true);
    });

    it("should render the color button", () => {
      const colorBtn = inputRichTextWrapperText.find("[data-test='color']");
      expect(colorBtn.exists()).toBe(true);
      expect(colorBtn.findComponent(IconEditorColor).exists()).toBe(true);
      expect(colorBtn.find("input").exists()).toBe(true);
    });

    it("should have the awaited style when the color change", async () => {
      const colorBtn = inputRichTextWrapperText.find("[data-test='color']");
      expect(colorBtn.exists()).toBe(true);
      let colorIcon = colorBtn.findComponent(IconEditorColor);
      expect(colorIcon.exists()).toBe(true);
      expect(colorIcon.element.style.fill).toBe("");
      await colorBtn.find("input").setValue("#958DF1");
      colorIcon = colorBtn.findComponent(IconEditorColor);
      expect(colorIcon.element.style.fill).toBe("#958df1");
    });

    it("should display the error message when present", async () => {
      let errorMessage = inputRichTextWrapperText.find(
        "[data-cy='error-message']",
      );
      expect(errorMessage.exists()).toBe(false);
      const customInputRichTextWrapperText = await mountSuspended(
        InputRichText,
        {
          props: {
            label: "Text",
            errorMessage: "This is required",
            modelValue: "",
          },
        },
      );
      errorMessage = customInputRichTextWrapperText.find(
        "[data-cy='error-message']",
      );
      expect(errorMessage.exists()).toBe(true);
      expect(errorMessage.text()).toBe("This is required");
    });

    it("should render the default `text` when provided", async () => {
      expect(
        inputRichTextWrapperText.findAll("p.is-editor-empty")[0].element.dataset
          .placeholder,
      ).toBe("Enter your text");
      const customInputRichTextWrapperText = await mountSuspended(
        InputRichText,
        {
          props: {
            label: "Text",
            placeholder: "Enter your text",
            isRequired: false,
            modelValue: "<p>There is the explanation</p>",
          },
        },
      );
      expect(
        customInputRichTextWrapperText.findAll("p.is-editor-empty").length,
      ).toBe(0);
      expect(
        customInputRichTextWrapperText
          .find("div[contenteditable='true']")
          .html(),
      ).toContain("<p>There is the explanation</p>");
    });
  });
});
