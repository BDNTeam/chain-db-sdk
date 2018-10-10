import express from "express";
import { error } from "./log";

export interface Route {
  method: string;
  pattern: string | RegExp;
  handler: express.RequestHandler;
  actualHandler?: express.RequestHandler;
}

export const routes: Route[] = [];

export function findByHandler(handler): Route | null {
  let ret: Route | null = null;
  routes.every(route => {
    if (route.handler === handler) {
      ret = route;
      return false;
    }
    return true;
  });
  if (ret === null) {
    ret = { method: "GET", pattern: "/", handler };
    routes.push(ret);
  }
  return ret;
}

export const method = (m = "GET") => {
  return (target, key, descriptor) => {
    m = m.toUpperCase();
    const route = findByHandler(descriptor.value);
    if (route === null) throw new Error("cannot find route by: " + descriptor.value);
    route.method = m;
  };
};

export const get = () => {
  return method();
};

export const post = () => {
  return method("POST");
};

export function pattern(p): MethodDecorator {
  return (target, key, descriptor) => {
    const route = findByHandler(descriptor.value);
    if (route === null) throw new Error("cannot find route by: " + descriptor.value);
    route.pattern = p;
  };
}

export function installTo(exp: express.Application) {
  routes.forEach(r => {
    const handler = r.actualHandler || r.handler;
    if (r.method === "GET") {
      exp.get(r.pattern, handler);
    } else if (r.method === "POST") {
      exp.post(r.pattern, handler);
    }
  });
}

export class ApiResponse {
  code = 0;
  msg = "";
  data: string | null = null;
}

export type ApiHandler = (req: express.Request, res: ApiResponse) => void;

export function api() {
  return (target, key, descriptor) => {
    const route = findByHandler(descriptor.value);
    if (route === null) throw new Error("cannot find route by: " + descriptor.value);
    const handler = descriptor.value;
    route.actualHandler = async (req: express.Request, res: express.Response) => {
      const apiResp = new ApiResponse();
      try {
        await handler(req, apiResp);
        res.send(apiResp);
      } catch (e) {
        error(e);

        apiResp.code = 1;
        apiResp.msg = "internal error";
        res.send(apiResp);
      }
    };
  };
}
