const publicInstanceProperty = {
  $el: (v) => v.vnode.el,
  $slots: (v) => v.slots,
};

export const PublicInstanceProxyHandlers = {
  get(instance, key) {
    const { setupState, props } = instance;
    console.log(key);
    const hasOwn = (obj, key) => Object.hasOwnProperty.call(obj, key);
    if (hasOwn(setupState, key)) {
      return setupState[key];
    } else if (hasOwn(props, key)) {
      return props[key];
    }
    const getter = publicInstanceProperty[key];
    if (getter) {
      return getter(instance);
    }
  },
};
