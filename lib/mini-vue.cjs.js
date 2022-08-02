'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const isObject = (val) => val !== null && typeof val === "object";

const targetMap = new WeakMap();
function trigger(target, key) {
    let depsMap = targetMap.get(target);
    let dep = depsMap.get(key);
    triggerEffect(dep);
}
function triggerEffect(dep) {
    if (!dep) {
        return;
    }
    for (let effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true, true);
const mutableHandler = {
    get,
    set,
};
const readonlyHandler = {
    get: createGetter(true),
    set: function (target, key, value) {
        console.warn(`目标对象${target}为readonly,key ${key} value ${value}`);
        return true;
    },
};
const shollowReadonlyHandler = {
    get: readonlyGet,
    set: readonlyHandler.set,
};
function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key) {
        const res = Reflect.get(target, key);
        if (key === "is_reactive" /* ReactiveFlag.IS_REACTIVE */) {
            return !isReadonly;
        }
        if (key === "is_readonly" /* ReactiveFlag.IS_READONLY */) {
            return isReadonly;
        }
        if (shallow) {
            return res;
        }
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        trigger(target, key);
        return res;
    };
}

function reactive(raw) {
    return new Proxy(raw, mutableHandler);
}
function readonly(raw) {
    return new Proxy(raw, readonlyHandler);
}
function shallowReadonly(raw) {
    if (!isObject(raw)) {
        console.warn(`target ${raw} mush is a object`);
        return raw;
    }
    return new Proxy(raw, shollowReadonlyHandler);
}

function emit(instance, eventName, ...args) {
    const { props } = instance;
    //对第一个字符大写
    const capitalize = (str) => str.slice(0, 1).toUpperCase() + str.slice(1);
    const camelize = (str) => {
        return str.replace(/-(\w)/g, (_, c) => {
            return c ? c.toLowerCase() : "";
        });
    };
    const getHandlerKey = (str) => {
        return str ? "on" + capitalize(str) : "";
    };
    const key = getHandlerKey(camelize(eventName));
    const handler = props[key];
    handler && handler(...args);
}

function initProps(instance, props) {
    instance.props = props;
}

function initSlots(instance, children) {
    const { vnode } = instance;
    if (vnode.shapeFlag & 16 /* shapeFlags.SLOT_CHILDREN */) {
        normalizeSlots(children, instance.slots);
    }
}
function normalizeSlotValue(value) {
    return Array.isArray(value) ? value : [value];
}
function normalizeSlots(children, slots) {
    for (const slot in children) {
        const value = children[slot];
        slots[slot] = (props) => normalizeSlotValue(value(props));
    }
    return slots;
}

let currentInstance = null;
/**
 * 创建组件实例
 * @param vnode
 */
function createComponentInstance(vnode, parentComponent) {
    const component = {
        vnode,
        type: vnode.type,
        proxy: {},
        setupState: {},
        emit: () => { },
        slots: {},
        provides: parentComponent ? parentComponent.provides : {},
        parent: parentComponent,
    };
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
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
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}

const publicInstanceProperty = {
    $el: (v) => v.vnode.el,
    $slots: (v) => v.slots,
};
const PublicInstanceProxyHandlers = {
    get(instance, key) {
        const { setupState, props } = instance;
        const hasOwn = (obj, key) => Object.hasOwnProperty.call(obj, key);
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        const getter = publicInstanceProperty[key];
        if (getter) {
            return getter(instance);
        }
    },
};

const Fragment = Symbol("Fragment");
const Text = Symbol("Text");
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
    if (vnode.shapeFlag & 2 /* shapeFlags.STATEFUL_COMPONENT */) {
        if (typeof children === "object") {
            vnode.shapeFlag |= 16 /* shapeFlags.SLOT_CHILDREN */;
        }
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
function createTextVNode(text) {
    return createVnode(Text, {}, text);
}

function render(vnode, container) {
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
            if (vnode.shapeFlag & 1 /* shapeFlags.ELEMENT */) {
                processElement(vnode, container, parentComponent);
            }
            else if (vnode.shapeFlag & 2 /* shapeFlags.STATEFUL_COMPONENT */) {
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
    if (shapeFlag & 4 /* shapeFlags.TEXT_CHILDREN */) {
        el.textContent = children;
    }
    else if (shapeFlag & 8 /* shapeFlags.ARRAY_CHILDREN */) {
        mountChildren(vnode, el, parentComponent);
    }
    container.append(el);
}
//处理children
function mountChildren(vnode, el, parentComponent) {
    vnode.children.forEach((child) => patch(child, el, parentComponent));
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

function renderSlots(slots, name, props) {
    const slot = slots[name];
    if (slot) {
        if (typeof slot === "function") {
            return createVnode(Fragment, {}, slot(props));
        }
    }
}

function provide(key, value) {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        let provides = currentInstance.provides;
        const parentProvide = currentInstance.parent.provides;
        if (provides === parentProvide) {
            provides = currentInstance.provides = Object.create(parentProvide);
        }
        provides[key] = value;
    }
}
function inject(key, defaultValue) {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const parentProvides = currentInstance.parent.provides;
        if (parentProvides) {
            if (key in parentProvides) {
                return parentProvides[key];
            }
            else if (typeof defaultValue === "function") {
                return defaultValue();
            }
            else {
                return defaultValue;
            }
        }
    }
}

exports.createApp = createApp;
exports.createTextVNode = createTextVNode;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.provide = provide;
exports.renderSlots = renderSlots;
