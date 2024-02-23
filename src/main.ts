import { createApp } from "vue";
import App from "./App.vue";
import "./assets/tailwind.css";

export interface NoteCoordinate {
  string: number; // 0 (low E) through 5 (high E)
  fret: number;
  label?: string;
  index?: number;
  originalIndex?: number;
}

createApp(App).mount("#app");
