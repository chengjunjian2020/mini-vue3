'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/**
 * 创建组件实例
 * @param vnode
 */
function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        proxy: {},
        setupState: {},
    };
    return component;
}
function setupComponent(instance) {
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

const publicInstanceProperty = {
    $el: (v) => v.el,
};
const PublicInstanceProxyHandlers = {
    get(instance, key) {
        const { setupState, vnode } = instance;
        if (key in setupState) {
            return setupState[key];
        }
        const getter = publicInstanceProperty[key];
        getter && getter(vnode);
    },
};

function render(vnode, container) {
    patch(vnode, container);
}
/**
 * 用来做DOM更新
 * @param vnode
 * @param container
 */
function patch(vnode, container) {
    if (vnode.shapeFlag & 1 /* shapeFlags.ELEMENT */) {
        processElement(vnode, container);
    }
    else if (vnode.shapeFlag & 2 /* shapeFlags.STATEFUL_COMPONENT */) {
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
    const el = document.createElement(type);
    vnode.el = el;
    const isOn = (s) => /^on[A-Z]/.test(s);
    for (let attr in props) {
        const attrValue = props[attr];
        if (isOn(attr)) {
            const eventName = attr.slice(2).toLowerCase();
            document.addEventListener(eventName, attrValue);
        }
        else {
            el.setAttribute(attr, attrValue);
        }
    }
    mountChildren(children, el, vnode);
    container.append(el);
}
//处理children
function mountChildren(children, el, vnode) {
    const { shapeFlag } = vnode;
    if (shapeFlag & 4 /* shapeFlags.TEXT_CHILDREN */) {
        el.textContent = children;
    }
    else if (shapeFlag & 8 /* shapeFlags.ARRAY_CHILDREN */) {
        children.forEach((child) => patch(child, el));
    }
}

function createVnode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        el: null,
        shapeFlag: getShapeFlag(type),
    };
    if (typeof children === "string") {
        vnode.shapeFlag |= 4 /* shapeFlags.TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= 8 /* shapeFlags.ARRAY_CHILDREN */;
    }
    return vnode;
}
function getShapeFlag(type) {
    if (typeof type === "string") {
        return 1 /* shapeFlags.ELEMENT */;
    }
    else {
        return 2 /* shapeFlags.STATEFUL_COMPONENT */;
    }
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // 首先会将所有渲染相关的转换成vnode 虚拟节点
            // 后续所有逻辑操作 都会基于vnode做处理
            const vnode = createVnode(rootComponent);
            render(vnode, rootContainer);
        },
    };
}

function h(type, props, children) {
    return createVnode(type, props, children);
}

exports.createApp = createApp;
exports.h = h;
