import express from "express";
import "./controller";
import * as router from "./router";
import { Config } from "./config";

export class App {
  exp: express.Application;

  constructor() {
    this.exp = express();
    router.installTo(this.exp);
  }

  async start(cb: (app: App) => void) {
    const cfg = await Config.singleton();
    const port = cfg.get<number>("base.port");
    this.exp.listen(port, () => cb(this));
  }
}

export const app = new App();
