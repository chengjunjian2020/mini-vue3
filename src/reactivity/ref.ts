import { hasChanged, isObject } from "../shared";
import { trackEffects, triggerEffect, isTracking } from "./effect";
import { reactive } from "./reactive";

/**
 * 实现响应式
 * 重复设置同样数据过滤
 * value如果是对象改为reactive
 */
class RefImpl {
  private _value: any;
  public _v_isRef = true;
  private deps;
  private _rawValue;

  constructor(value) {
    this._rawValue = value;
    this._value = convert(value);
    this.deps = new Set();
  }

  get value() {
    if (isTracking()) {
      trackEffects(this.deps);
    }
    return this._value;
  }

  set value(newValue) {
    if (hasChanged(newValue, this._rawValue)) {
      this._rawValue = newValue;
      this._value = convert(newValue);
      triggerEffect(this.deps);
    }
  }
}

function convert(value) {
  return isObject(value) ? reactive(value) : value;
}

export function ref(value) {
  return new RefImpl(value);
}

export function isRef(ref) {
  return !!ref["_v_isRef"];
}
export function unRef(ref) {
  return isRef(ref) ? ref.value : ref;
}

export function proxyRefs(objectWithRefs) {
  return new Proxy(objectWithRefs, {
    get(target, key) {
      return unRef(Reflect.get(target, key));
    },
    set(target, key, value) {
      //如果是普通修改
      if (isRef(target[key]) && !isRef(value)) {
        return (target[key].value = value);
      } else {
        //如果value是ref则特殊处理
        return Reflect.set(target, key, value);
      }
    },
  });
}
