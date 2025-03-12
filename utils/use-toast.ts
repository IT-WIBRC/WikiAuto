type POSITION = "top left" | "top right" | "bottom left" | "bottom right";

// TODO: Make that the application need to use one instance (Each creation get the last instance with default value)
export default class Toast {
  private targetToAttachTo: HTMLElement = document.body;
  private timeOut = 0;
  private container: HTMLDivElement = null;
  private testMessage: HTMLParagraphElement = null;
  private progressBar: HTMLDivElement = null;
  private durationInSecond = 10;

  get containerElement(): HTMLElement | null {
    return this.container;
  }

  get messageElement(): HTMLParagraphElement | null {
    return this.testMessage;
  }

  get progressBarElement(): HTMLDivElement | null {
    return this.progressBar;
  }

  get duration(): number {
    return this.durationInSecond;
  }

  get timeout(): number {
    return this.timeOut;
  }

  constructor() {
    if (this.container !== null) {
      this.container.innerHTML = "";
      this.testMessage.innerHTML = "";
      this.progressBar.innerHTML = "";
      clearTimeout(this.timeOut);
    }
    this.container = document.createElement("div");
    this.testMessage = document.createElement("p");
    this.progressBar = document.createElement("div");
  }

  setPosition(position: POSITION) {
    switch (position) {
      case "bottom left":
        this.container.style.inset = "auto auto 0.5rem 1rem";
        break;
      case "top left":
        this.container.style.inset = "0.5rem auto auto 1rem";
        break;
      case "top right":
        this.container.style.inset = "0.5rem 1rem auto auto";
        break;
      default:
        this.container.style.inset = "auto 1rem 0.5rem auto";
        break;
    }
    return this;
  }

  reset(): void {
    this.durationInSecond = 10;
    this.timeOut = 0;

    this.targetToAttachTo = document.body;
    this.container = document.createElement("div");
    this.testMessage = document.createElement("p");
    this.progressBar = document.createElement("div");

    clearTimeout(this.timeOut);
  }

  setDuration(durationInSecond: number): this {
    this.durationInSecond = durationInSecond;
    return this;
  }

  remove(): void {
    this.container?.removeChild(this.progressBar);
    this.container?.removeChild(this.testMessage);
    this.targetToAttachTo?.removeChild(this.container);

    this.reset();
  }

  private addDataTest(): void {
    this.container.dataset.test = "container";
    this.testMessage.dataset.test = "message";
    this.progressBar.dataset.test = "progress-bar";
  }

  add(): void {
    this.addDataTest();
    this.targetToAttachTo?.appendChild(this.container);
    this.timeOut = setTimeout(
      () => this.remove(),
      this.durationInSecond * 1_000,
    );
  }

  setDefaultConfig(): void {
    const baseStyle = document.createElement("style");
    baseStyle.textContent = `
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
    `;
    this.container.append(baseStyle);
    this.container.className = "toast";

    this.testMessage.style.padding = "0.5rem 1rem";

    const baseProgressBarStyle = document.createElement("style");
    baseProgressBarStyle.textContent = `
    .progress-bar {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 4px;
        animation: ${this.durationInSecond}s linear forwards move;
      }
      
      @keyframes move { 
         from {
           width: 0;
         }
        to {
          width: 100%;
        }
      }
    `;
    this.progressBar.append(baseProgressBarStyle);
    this.progressBar.className = "progress-bar";
  }

  error(message: string, useDefaultInitialisation: boolean = true): void {
    if (useDefaultInitialisation) {
      this.setPosition("bottom right");
    }

    this.setDefaultConfig();

    this.testMessage.style.color = "rgb(220, 38, 38)";
    this.testMessage.innerText = message;
    this.container.appendChild(this.testMessage);

    this.progressBar.style.backgroundColor = "rgb(248, 113, 113)";
    this.container.appendChild(this.progressBar);

    this.container.style.boxShadow =
      "0 4px 6px -1px rgb(220, 38, 38, 0.1), 0 2px 4px -2px rgb(220, 38, 38, 0.1)";

    this.add();
  }

  success(message: string, useDefaultInitialisation: boolean = true): void {
    if (useDefaultInitialisation) {
      this.setPosition("bottom right");
    }
    this.setDefaultConfig();

    this.testMessage.style.color = "rgb(74,222,128)";
    this.testMessage.innerText = message;
    this.container.appendChild(this.testMessage);

    this.progressBar.style.backgroundColor = "rgb(34, 197, 94)";
    this.container.appendChild(this.progressBar);

    this.container.style.boxShadow =
      "0 4px 6px -1px rgb(74,222,128,0.1), 0 2px 4px -2px rgb(74,222,128,0.1)";

    this.add();
  }
}
