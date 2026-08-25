import { createSSRApp } from "vue";
import App from "./App.vue";
import store from "./stores";
import "uno.css";
import "@/styles/common.scss";
import { setupVisitTracking } from "@/utils/visit-tracker";

export function createApp() {
  const app = createSSRApp(App);
  app.use(store);
  setupVisitTracking();
  return { app };
}
