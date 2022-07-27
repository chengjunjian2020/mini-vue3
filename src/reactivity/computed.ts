import { ReactiveEffect } from "./effect";

class ComputedImpl {
  private _getter: Function;

  private _dirty: boolean = true;

  private _value: any;

  private _effect: any;

  constructor(_getter: Function) {
    this._getter = _getter;
    this._effect = new ReactiveEffect(_getter, () => {
      if (!this._dirty) {
        this._dirty = true;
      }
    });
  }

  get value() {
    if (this._dirty) {
      this._dirty = false;
      this._value = this._effect.run();
    }
    return this._value;
  }
}

export function computed(getter) {
  return new ComputedImpl(getter);
}
