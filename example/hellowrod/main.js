import { createApp } from "../../lib/mini-vue.esm.js";
import { App } from "./App.js";

let container = document.querySelector("#app");
createApp(App).mount(container);
