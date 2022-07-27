import { shapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { PublicInstanceProxyHandlers } from "./componentPublicInstance";

export function render(vnode, container) {
  patch(vnode, container);
}

/**
 * 用来做DOM更新
 * @param vnode
 * @param container
 */
function patch(vnode, container) {
  if (vnode.shapeFlag & shapeFlags.ELEMENT) {
    processElement(vnode, container);
  } else if (vnode.shapeFlag & shapeFlags.STATEFUL_COMPONENT) {
    processComponent(vnode, container);
  }
}

/**
 *
 * @param vnode
 * @param container
 */
function processComponent(vnode, container) {
  mountComponent(vnode, container);
}

/**
 * 挂载组件
 * @param vnode
 * @param container
 */
function mountComponent(vnode, container) {
  //对组件实例化
  const instance = createComponentInstance(vnode);
  instance.proxy = new Proxy(instance, PublicInstanceProxyHandlers);

  setupComponent(instance);
  setupRenderEffect(instance, container);
}

function setupRenderEffect(instance, container) {
  const subTree = instance.type.render.call(instance.proxy);

  patch(subTree, container);
  instance.vnode.el = subTree.el;
}

function processElement(vnode, container) {
  mountElement(vnode, container);
}
/**
 * 挂载元素
 * @param vnode
 * @param container
 */
function mountElement(vnode, container) {
  const { props, children, type } = vnode;

  const el: HTMLElement = document.createElement(type);

  vnode.el = el;

  const isOn = (s) => /^on[A-Z]/.test(s);
  for (let attr in props) {
    const attrValue = props[attr];

    if (isOn(attr)) {
      const eventName = attr.slice(2).toLowerCase();
      document.addEventListener(eventName, attrValue);
    } else {
      el.setAttribute(attr, attrValue);
    }
  }

  mountChildren(children, el, vnode);

  container.append(el);
}

//处理children
function mountChildren(children, el: HTMLElement, vnode) {
  const { shapeFlag } = vnode;
  if (shapeFlag & shapeFlags.TEXT_CHILDREN) {
    el.textContent = children;
  } else if (shapeFlag & shapeFlags.ARRAY_CHILDREN) {
    children.forEach((child) => patch(child, el));
  }
}
