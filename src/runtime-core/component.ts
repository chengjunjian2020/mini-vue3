import { shallowReadonly } from "../reactivity/reactive";
import { emit } from "./componentEmit";
import { initProps } from "./componentProps";
import { initSlots } from "./componentSlots";

/**
 * 创建组件实例
 * @param vnode
 */
export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type,
    proxy: {},
    setupState: {},
    emit: () => {},
    slots: {},
  };
  component.emit = emit.bind(null, component) as any;
  return component;
}

export function setupComponent(instance) {
  initProps(instance, instance.vnode.props);
  initSlots(instance, instance.vnode.children);
  setupStatefulComponent(instance);
}

function setupStatefulComponent(instance) {
  const component = instance.type;
  const { emit } = instance;
  const { setup } = component;
  if (setup) {
    const setupResult = setup(shallowReadonly(instance.props), { emit });
    handleSetupResult(instance, setupResult);
  }
}

function handleSetupResult(instance, setupResult) {
  // TODO 后续实现Function 本次只实现Object
  if (typeof setupResult === "object") {
    instance.setupState = setupResult;
  }
  finishComponentSetup(instance);
}

function finishComponentSetup(instance) {
  const component = instance.type;
  if (component.render) {
    instance.render = component.render;
  }
}
