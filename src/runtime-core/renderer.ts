import { shapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { PublicInstanceProxyHandlers } from "./componentPublicInstance";
import { fragment, Text } from "./vnode";

export function render(vnode, container) {
  patch(vnode, container);
}

/**
 * 用来做DOM更新
 * @param vnode
 * @param container
 */
function patch(vnode, container) {
  console.log(vnode.type);
  switch (vnode.type) {
    case fragment:
      processFragment(vnode, container);
      break;
    case Text:
      processText(vnode, container);
      break;
    default:
      if (vnode.shapeFlag & shapeFlags.ELEMENT) {
        processElement(vnode, container);
      } else if (vnode.shapeFlag & shapeFlags.STATEFUL_COMPONENT) {
        processComponent(vnode, container);
      }
  }
}

// 处理Fragment标签
function processFragment(vnode, container) {
  mountChildren(vnode, container);
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
    console.log();
    mountChildren(vnode, el);
  }
  container.append(el);
}

//处理children
function mountChildren(vnode, el: HTMLElement) {
  vnode.children.forEach((child) => patch(child, el));
}
