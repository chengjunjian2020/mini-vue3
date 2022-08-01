import { extend } from "../shared";
interface effectOption {
  scheduler?: Function;
  onStop?: Function;
}
const targetMap = new WeakMap();
let currentEffect;
let shouldTrack = false;
export class ReactiveEffect {
  private fn: Function;
  deps: Array<Set<this>> = [];
  isRunning: boolean = true;
  onStop?: Function;
  public scheduler: Function | undefined;

  constructor(_fn: Function, scheduler?) {
    this.fn = _fn;
    this.scheduler = scheduler;
  }

  run() {
    if (!this.isRunning) {
      return this.fn();
    }
    shouldTrack = true;
    currentEffect = this;
    const result = this.fn();
    shouldTrack = false;
    return result;
  }

  stop() {
    if (this.isRunning) {
      cleanupEffect(this);
      if (this.onStop) {
        this.onStop();
      }
      this.isRunning = false;
    }
  }
}

function cleanupEffect(effect) {
  effect.deps.forEach((dep) => {
    dep.delete(effect);
  });
  effect.deps.length = 0;
}

//收集依赖
export function track(target, key) {
  if (!isTracking()) {
    return;
  }
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }

  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }

  trackEffects(dep);
}
export function isTracking() {
  return shouldTrack && currentEffect !== undefined;
}
export function trackEffects(dep: Set<any>) {
  // 看看 dep 之前有没有添加过，添加过的话 那么就不添加了
  if (dep.has(currentEffect)) return;
  dep.add(currentEffect);
  currentEffect.deps.push(dep);
}
export function effect(fn: Function, option: effectOption = {}) {
  const scheduler = option.scheduler;
  const reactiveEffect = new ReactiveEffect(fn, scheduler);
  extend(reactiveEffect, option);

  reactiveEffect.run();

  const runner: any = reactiveEffect.run.bind(reactiveEffect);
  runner.effect = reactiveEffect;
  return runner;
}

export function trigger(target, key) {
  let depsMap = targetMap.get(target);
  let dep = depsMap.get(key);
  triggerEffect(dep);
}
export function triggerEffect(dep: Set<any>) {
  if (!dep) {
    return;
  }
  for (let effect of dep) {
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect.run();
    }
  }
}
export function stop(runner) {
  runner.effect.stop();
}
