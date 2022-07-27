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
  };
  return component;
}

export function setupComponent(instance) {
  // TODO
  // props
  // slots
  setupStatefulComponent(instance);
}

function setupStatefulComponent(instance) {
  const component = instance.type;
  const { setup } = component;
  if (setup) {
    const setupResult = setup();
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
    component.render();
  }
}
