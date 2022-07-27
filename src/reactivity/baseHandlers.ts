import { track, trigger } from "./effect";
import { reactive, readonly, ReactiveFlag } from "./reactive";
import { isObject } from "../shared";
const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true, true);
export const mutableHandler = {
  get,
  set,
};

export const readonlyHandler = {
  get: createGetter(true),
  set: function (target, key: string, value) {
    console.warn(`目标对象${target}为readonly,key ${key} value ${value}`);
    return true;
  },
};
export const shollowReadonlyHandler = {
  get: readonlyGet,
  set: readonlyHandler.set,
};

export function createGetter(isReadonly = false, shallow = false) {
  return function get(target, key) {
    const res = Reflect.get(target, key);
    if (key === ReactiveFlag.IS_REACTIVE) {
      return !isReadonly;
    }
    if (key === ReactiveFlag.IS_READONLY) {
      return isReadonly;
    }

    if (shallow) {
      return res;
    }

    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res);
    }
    //添加依赖
    if (!isReadonly) {
      track(target, key as string);
    }
    return res;
  };
}

export function createSetter() {
  return function set(target, key, value) {
    const res = Reflect.set(target, key, value);
    trigger(target, key);
    return res;
  };
}
