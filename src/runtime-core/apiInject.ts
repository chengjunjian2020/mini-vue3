import { getCurrentInstance } from "./component";
export function provide(key, value) {
  const currentInstance: any = getCurrentInstance();
  if (currentInstance) {
    let provides = currentInstance.provides;
    const parentProvide = currentInstance.parent.provides;
    if (provides === parentProvide) {
      provides = currentInstance.provides = Object.create(parentProvide);
    }
    provides[key] = value;
  }
}

export function inject(key, defaultValue?: string | Function) {
  const currentInstance: any = getCurrentInstance();
  if (currentInstance) {
    const parentProvides = currentInstance.parent.provides;
    if (parentProvides) {
      if (key in parentProvides) {
        return parentProvides[key];
      } else if (typeof defaultValue === "function") {
        return defaultValue();
      } else {
        return defaultValue;
      }
    }
  }
}
