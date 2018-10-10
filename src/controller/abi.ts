import express from "express";
import { get, pattern, api, ApiResponse } from "../router";
import path from "path";
import fs from "fs";
import util from "util";

const exist = util.promisify(fs.exists);
const read = util.promisify(fs.readFile);

export class AbiController {
  @api()
  @pattern("/abi/get")
  @get()
  async get(req: express.Request, res: ApiResponse) {
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
}
