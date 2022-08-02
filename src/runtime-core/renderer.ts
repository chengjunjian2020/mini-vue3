import { shapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { PublicInstanceProxyHandlers } from "./componentPublicInstance";
import { Fragment, Text } from "./vnode";

export function render(vnode, container) {
  patch(vnode, container, null);
}

/**
 * 用来做DOM更新
 * @param vnode
 * @param container
 */
function patch(vnode, container, parentComponent) {
  switch (vnode.type) {
    case Fragment:
      processFragment(vnode, container, parentComponent);
      break;
    case Text:
      processText(vnode, container);
      break;
    default:
      if (vnode.shapeFlag & shapeFlags.ELEMENT) {
        processElement(vnode, container, parentComponent);
      } else if (vnode.shapeFlag & shapeFlags.STATEFUL_COMPONENT) {
        processComponent(vnode, container, parentComponent);
      }
  }
}

// 处理Fragment标签
function processFragment(vnode, container, parentComponent) {
  mountChildren(vnode, container, parentComponent);
}

function processText(vnode, container) {
  const textNode = document.createTextNode(vnode.children);
  vnode.el = textNode;
  container.append(textNode);
}
/**
 *
 * @param vnode
 * @param container
 */
function processComponent(vnode, container, parentComponent) {
  mountComponent(vnode, container, parentComponent);
}

/**
 * 挂载组件
 * @param vnode
 * @param container
 */
function mountComponent(vnode, container, parentComponent) {
  //对组件实例化
  const instance = createComponentInstance(vnode, parentComponent);
  instance.proxy = new Proxy(instance, PublicInstanceProxyHandlers);

  setupComponent(instance);
  setupRenderEffect(instance, container);
}

function setupRenderEffect(instance, container) {
  const subTree = instance.type.render.call(instance.proxy);

  patch(subTree, container, instance);
  instance.vnode.el = subTree.el;
}

function processElement(vnode, container, parentComponent) {
  mountElement(vnode, container, parentComponent);
}
/**
 * 挂载元素
 * @param vnode
 * @param container
 */
function mountElement(vnode, container, parentComponent) {
  const { props, children, type, shapeFlag } = vnode;

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

  if (shapeFlag & shapeFlags.TEXT_CHILDREN) {
    el.textContent = children;
  } else if (shapeFlag & shapeFlags.ARRAY_CHILDREN) {
    mountChildren(vnode, el, parentComponent);
  }
  container.append(el);
}

//处理children
function mountChildren(vnode, el: HTMLElement, parentComponent) {
  vnode.children.forEach((child) => patch(child, el, parentComponent));
}
