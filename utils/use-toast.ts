type POSITION = "top left" | "top right" | "bottom left" | "bottom right";

export default {
  targetToAttachTo: document.body,
  timeOut: 0,
  container: null,
  testMessage: null,
  progressBar: null,
  duration: 10,
  initialize() {
    const isContainerExist = document.querySelector("[data-test='container']");
    if (isContainerExist) {
      document.body.removeChild(isContainerExist);
      clearTimeout(this.timeOut);
    }
    this.container = document.createElement("div");
    this.testMessage = document.createElement("p");
    this.progressBar = document.createElement("div");
    const baseStyle = document.createElement("style");
    baseStyle.textContent = `
    .toast {
        position: fixed;
        z-index: 50;
        bottom: 0.5rem;
        right: 1rem;
        background-color: #fff;
        border: 1px;
        border-radius: 6px;
        display: flex;
        flex-direction: column;
        min-width: 200px;
        justify-content: center;
      }
    `;
    this.container.append(baseStyle);

    this.testMessage.style.padding = "0.5rem 1rem";

    this.progressBar.style.height = "4px";
    this.progressBar.style.width = "100%";
    this.progressBar.animate(
      [
        {
          width: "0",
        },
      ],
      {
        duration: this.duration * 1_000,
        fill: "forwards",
      },
    );

    this.container.className = "toast";
  },
  setPosition(position: POSITION) {
    this.container.style.bottom = 0;
    this.container.style.top = 0;
    this.container.style.left = 0;
    this.container.style.right = 0;

    switch (position) {
      case "bottom left":
        this.container.style.bottom = "0.5rem";
        this.container.style.left = "1rem";
        break;
      case "top left":
        this.container.style.top = "0.5rem";
        this.container.style.left = "1rem";
        break;
      case "top right":
        this.container.style.top = "0.5rem";
        this.container.style.right = "1rem";
        break;
      default:
        this.container.style.bottom = "0.5rem";
        this.container.style.right = "1rem";
        break;
    }
    return this;
  },
  reset() {
    this.container = null;
    this.testMessage = null;
    this.progressBar = null;
  },
  setDuration(duration: number) {
    this.duration = duration;
    return this;
  },
  remove() {
    this.container?.removeChild(this.progressBar);
    this.container?.removeChild(this.testMessage);
    this.targetToAttachTo?.removeChild(this.container);

    this.container = null;
    this.testMessage = null;
    this.progressBar = null;

    this.reset();
  },
  add() {
    this.addDataTest();
    this.targetToAttachTo?.appendChild(this.container);
    this.timeOut = setTimeout(() => this.remove(), this.duration * 1_000);
  },
  error(message: string) {
    this.initialize();

    this.testMessage.style.color = "rgb(220, 38, 38)";
    this.testMessage.innerText = message;
    this.container.appendChild(this.testMessage);

    this.progressBar.style.backgroundColor = "rgb(248, 113, 113)";
    this.container.appendChild(this.progressBar);

    this.container.style.boxShadow =
      "0 4px 6px -1px rgb(220, 38, 38, 0.1), 0 2px 4px -2px rgb(220, 38, 38, 0.1)";

    this.add();
  },
  success(message: string) {
    this.initialize();

    this.testMessage.style.color = "rgb(74,222,128)";
    this.testMessage.innerText = message;
    this.container.appendChild(this.testMessage);

    this.progressBar.style.backgroundColor = "rgb(34, 197, 94)";
    this.container.appendChild(this.progressBar);

    this.container.style.boxShadow =
      "0 4px 6px -1px rgb(74,222,128,0.1), 0 2px 4px -2px rgb(74,222,128,0.1)";

    this.add();
  },
  addDataTest() {
    this.container.dataset.test = "container";
    this.testMessage.dataset.test = "message";
    this.progressBar.dataset.test = "progress-bar";
  },
};
