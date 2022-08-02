import { shallowReadonly } from "../reactivity/reactive";
import { emit } from "./componentEmit";
import { initProps } from "./componentProps";
import { initSlots } from "./componentSlots";

let currentInstance = null;
/**
 * 创建组件实例
 * @param vnode
 */
export function createComponentInstance(vnode, parentComponent) {
  const component = {
    vnode,
    type: vnode.type,
    proxy: {},
    setupState: {},
    emit: () => {},
    slots: {},
    provides: parentComponent ? parentComponent.provides : {},
    parent: parentComponent,
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
  setCurrentInstance(instance);
  if (setup) {
    const setupResult = setup(shallowReadonly(instance.props), { emit });
    handleSetupResult(instance, setupResult);
  }
  setCurrentInstance(null);
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

export function getCurrentInstance() {
  return currentInstance;
}
function setCurrentInstance(instance) {
  currentInstance = instance;
}
