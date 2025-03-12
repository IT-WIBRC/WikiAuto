import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { JSDOM } from "jsdom";
import Toast from "../use-toast";

describe("use-Toast", () => {
  afterAll(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  let customDom = null;
  let useToast: Toast = null;
  let mockInstance: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    customDom = new JSDOM(`<!DOCTYPE html><html lang="en"><body>
              <div id="modal"></div>
            </body></html>`);
    mockInstance = vi
      .spyOn(window, "document", "get")
      .mockReturnValue(customDom.window.document);

    useToast = new Toast();
  });

  afterEach(() => {
    customDom = null;
    useToast = null;
    mockInstance.mockRestore();

    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe("setDuration", () => {
    it("should set the durationInSecond successfully", () => {
      vi.useFakeTimers();

      useToast.setDuration(20).success("Success", false);

      expect(useToast.duration).toBe(20);

      vi.advanceTimersByTime(20_000);

      expect(useToast.duration).toBe(10);

      mockInstance.mockRestore();
      vi.clearAllTimers();
      vi.useRealTimers();
    });
  });

  describe("setPosition", () => {
    it("should set the position to `bottom right` by default", () => {
      vi.useFakeTimers();

      useToast.success("Success");
      const containerElement = customDom.window.document.body.querySelector(
        "[data-test='container']",
      );
      expect(containerElement?.style.inset).toBe("auto 1rem 0.5rem auto");

      vi.advanceTimersByTime(10_000);
    });

    it("should set the position to `bottom left` when changed", () => {
      vi.useFakeTimers();

      useToast.setPosition("bottom left").success("Success", false);
      const containerElement = customDom.window.document.body.querySelector(
        "[data-test='container']",
      );
      expect(containerElement?.style.inset).toBe("auto auto 0.5rem 1rem");

      vi.advanceTimersByTime(10_000);
    });

    it("should set the position to `top left` when changed", () => {
      vi.useFakeTimers();

      useToast.setPosition("top left").success("Success", false);
      const containerElement = customDom.window.document.body.querySelector(
        "[data-test='container']",
      );
      expect(containerElement?.style.inset).toBe("0.5rem auto auto 1rem");

      vi.advanceTimersByTime(10_000);
    });

    it("should set the position to `top right` when changed", () => {
      vi.useFakeTimers();

      useToast.setPosition("top right").success("Success", false);
      const containerElement = customDom.window.document.body.querySelector(
        "[data-test='container']",
      );
      expect(containerElement?.style.inset).toBe("0.5rem 1rem auto auto");

      vi.advanceTimersByTime(10_000);
    });
  });

  describe("reset", () => {
    it("should reset the properties successfully", () => {
      expect(useToast.progressBarElement.style.height).toBe("");
      expect(useToast.messageElement.className).toBe("");
      expect(useToast.containerElement.className).not.toBe("toast");

      useToast.setDefaultConfig();

      expect(useToast.containerElement.className).toBe("toast");
      expect(useToast.messageElement.style.padding).toBe("0.5rem 1rem");
      expect(useToast.progressBarElement.className).toBe("progress-bar");

      useToast.setDuration(30);
      expect(useToast.duration).toBe(30);

      useToast.reset();

      expect(useToast.duration).toBe(10);
      expect(useToast.timeout).toBe(0);

      expect(useToast.progressBarElement.className).toBe("");
      expect(useToast.messageElement.style.padding).toBe("");
      expect(useToast.containerElement.className).not.toBe("toast");
    });
  });

  it("should set the default config successfully", () => {
    expect(useToast.messageElement.style.padding).toBe("");
    expect(useToast.progressBarElement.style.height).toBe("");
    expect(useToast.containerElement.className).not.toBe("toast");

    useToast.setDefaultConfig();

    expect(useToast.containerElement.className).toBe("toast");
    expect(useToast.containerElement.querySelector("style").textContent).toBe(`
    .toast {
        position: fixed;
        z-index: 100;
        background-color: #1b1c1c;
        border: 1px;
        border-radius: 4px;
        min-height: 60px;
        min-width: 200px;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    `);

    expect(useToast.messageElement.style.padding).toBe("0.5rem 1rem");

    expect(useToast.progressBarElement.className).toBe("progress-bar");
    expect(useToast.progressBarElement.querySelector("style").textContent)
      .toBe(`
    .progress-bar {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 4px;
        animation: ${useToast.duration}s linear forwards move;
      }
      
      @keyframes move { 
         from {
           width: 0;
         }
        to {
          width: 100%;
        }
      }
    `);
  });

  it("should add to the DOM correctly", () => {
    vi.spyOn(useToast, "remove");
    vi.spyOn(useToast, "add");

    vi.useFakeTimers();

    useToast.success("test");

    vi.advanceTimersByTime(5_000);
    expect(useToast.add).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(5_000);
    expect(useToast.remove).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
    vi.clearAllTimers();
  });

  it("should display the message correctly on error", () => {
    vi.useFakeTimers();

    vi.spyOn(useToast, "setDefaultConfig");
    vi.spyOn(useToast, "add");

    useToast.error("Message");

    const messageElement = customDom.window.document.body.querySelector(
      "[data-test='message']",
    );
    expect(messageElement).not.toBeNull();
    expect(messageElement?.innerText).toBe("Message");
    expect(messageElement?.style.color).toBe("rgb(220, 38, 38)");

    const progressBarElement = customDom.window.document.body.querySelector(
      "[data-test='progress-bar']",
    );
    expect(progressBarElement).not.toBeNull();
    expect(progressBarElement?.style.backgroundColor).toContain(
      "rgb(248, 113, 113)",
    );
    expect(progressBarElement?.className).toContain("progress-bar");

    vi.advanceTimersByTime(10_000);

    expect(
      customDom.window.document.body.querySelector("[data-test='message']"),
    ).toBeNull();
    expect(
      customDom.window.document.body.querySelector(
        "[data-test='progress-bar']",
      ),
    ).toBeNull();

    expect(useToast.setDefaultConfig).toHaveBeenCalledTimes(1);
    expect(useToast.add).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it("should display the message correctly on success", () => {
    vi.clearAllTimers();

    vi.spyOn(useToast, "setDefaultConfig");
    vi.spyOn(useToast, "add");

    vi.useFakeTimers();

    useToast.setDuration(15).setPosition("top left").success("Success", false);

    const messageElement = customDom.window.document.body.querySelector(
      "[data-test='message']",
    );

    expect(messageElement).not.toBeNull();
    expect(messageElement?.innerText).toBe("Success");
    expect(messageElement?.style.color).toBe("rgb(74, 222, 128)");

    const progressBarElement = customDom.window.document.body.querySelector(
      "[data-test='progress-bar']",
    );
    expect(progressBarElement).not.toBeNull();
    expect(progressBarElement?.className).toContain("progress-bar");
    expect(progressBarElement?.style.backgroundColor).toContain(
      "rgb(34, 197, 94)",
    );

    vi.advanceTimersByTime(15_000);

    expect(
      customDom.window.document.body.querySelector("[data-test='message']"),
    ).toBeNull();
    expect(
      customDom.window.document.body.querySelector(
        "[data-test='progress-bar']",
      ),
    ).toBeNull();

    expect(useToast.setDefaultConfig).toHaveBeenCalledTimes(1);
    expect(useToast.add).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });
});
