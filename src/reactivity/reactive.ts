import { isObject } from "../shared";
import {
  mutableHandler,
  readonlyHandler,
  shollowReadonlyHandler,
} from "./baseHandlers";

export const enum ReactiveFlag {
  "IS_REACTIVE" = "is_reactive",
  "IS_READONLY" = "is_readonly",
}

export function reactive(raw) {
  return new Proxy(raw, mutableHandler);
}

export function readonly(raw) {
  return new Proxy(raw, readonlyHandler);
}

export function shallowReadonly(raw) {
  if (!isObject(raw)) {
    console.warn(`target ${raw} mush is a object`);
    return raw;
  }
  return new Proxy(raw, shollowReadonlyHandler);
}

export function isReactive(value) {
  if (!value || typeof value !== "object") {
    console.warn("value parameter exception");
    return false;
  }
  return !!value[ReactiveFlag.IS_REACTIVE];
}

export function isReadonly(value) {
  if (!value || typeof value !== "object") {
    console.warn("value parameter exception");
    return false;
  }
  return !!value[ReactiveFlag.IS_READONLY];
}

export function isProxy(value) {
  return isReactive(value) || isReadonly(value);
}
