import { h } from "../../lib/mini-vue.esm.js";

export const App = {
  render() {
    window.self = this;
    return h(
      "div",
      {
        id: "root",
        class: ["red", "hard"],
        onClick() {
          console.log("click");
        },
        onMousedown() {
          console.log("mousedown");
        },
      },

      [h("p", { class: "red" }, "hi"), h("p", { class: "blue" }, this.mini)]
    );
  },

  setup() {
    return {
      mini: "mini-vue",
    };
  },
};
