import { shapeFlags } from "../shared/shapeFlags";
export const Fragment = Symbol("Fragment");
export const Text = Symbol("Text");
export function createVnode(type, props?, children?) {
  const vnode = {
    type,
    props,
    children,
    el: null,
    shapeFlag: getShapeFlag(type),
  };
  if (typeof children === "string") {
    vnode.shapeFlag |= shapeFlags.TEXT_CHILDREN;
  } else if (Array.isArray(children)) {
    vnode.shapeFlag |= shapeFlags.ARRAY_CHILDREN;
  }

  if (vnode.shapeFlag & shapeFlags.STATEFUL_COMPONENT) {
    if (typeof children === "object") {
      vnode.shapeFlag |= shapeFlags.SLOT_CHILDREN;
    }
  }
  return vnode;
}

function getShapeFlag(type) {
  if (typeof type === "string") {
    return shapeFlags.ELEMENT;
  } else {
    return shapeFlags.STATEFUL_COMPONENT;
  }
}

export function createTextVNode(text: string) {
  return createVnode(Text, {}, text);
}
