const publicInstanceProperty = {
  $el: (v) => v.el,
};

export const PublicInstanceProxyHandlers = {
  get(instance, key) {
    const { setupState, vnode } = instance;
    if (key in setupState) {
      return setupState[key];
    }
    const getter = publicInstanceProperty[key];
    getter && getter(vnode);
  },
};
