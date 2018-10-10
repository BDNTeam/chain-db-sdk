import express from "express";
import { get, pattern, api, ApiResponse } from "../router";
import path from "path";
import fs from "fs";
import util from "util";
import { Config } from "../config";

const exist = util.promisify(fs.exists);
const read = util.promisify(fs.readFile);

export class ContractController {
  @api()
  @pattern("/contract/getAbi")
  @get()
  async getAbi(req: express.Request, res: ApiResponse) {
    const name = req.query.name;
    if (!name) {
      res.code = 1;
      res.msg = "missing params";
      return;
    }

    const f = path.resolve(__dirname, "../contracts", name + ".json");
    const ex = await exist(f);
    if (!ex) {
      res.code = 1;
      res.msg = "invalid params";
      return;
    }

    const data = await read(f, { encoding: "utf-8" });
    res.data = JSON.parse(data).abi;
  }

  @api()
  @pattern("/contract/getMarketAddr")
  @get()
  async getMarketAddr(req: express.Request, res: ApiResponse) {
    const cfg = await Config.singleton();
    res.data = cfg.get<string>("contract.marketAddr");
  }

  @api()
  @pattern("/contract/getBdnAddr")
  @get()
  async getBdnAddr(req: express.Request, res: ApiResponse) {
    const cfg = await Config.singleton();
    res.data = cfg.get<string>("contract.bdnAddr");
  }
}
