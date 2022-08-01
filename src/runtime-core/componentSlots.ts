import { shapeFlags } from "../shared/shapeFlags";

export function initSlots(instance, children) {
  const { vnode } = instance;
  if (vnode.shapeFlag & shapeFlags.SLOT_CHILDREN) {
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
