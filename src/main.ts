import { app } from "./app";
import { info } from "./log";

(async () => {
  await app.start(() => {
    info("Server is running");
  });
})();
