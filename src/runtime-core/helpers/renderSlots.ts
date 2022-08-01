import { createVnode, fragment } from "../vnode";
export function renderSlots(slots, name, props) {
  const slot = slots[name];
  if (slot) {
    if (typeof slot === "function") {
      return createVnode(fragment, {}, slot(props));
    }
  }
}
