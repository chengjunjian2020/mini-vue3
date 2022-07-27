import { render } from "./renderer";
import { createVnode } from "./vnode";

export function createApp(rootComponent) {
  return {
    mount(rootContainer) {
      // 首先会将所有渲染相关的转换成vnode 虚拟节点
      // 后续所有逻辑操作 都会基于vnode做处理
      const vnode = createVnode(rootComponent);
      render(vnode, rootContainer);
    },
  };
}
