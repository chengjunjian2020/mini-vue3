export function emit(instance, eventName, ...args) {
  const { props } = instance;

  //对第一个字符大写
  const capitalize = (str: string) =>
    str.slice(0, 1).toUpperCase() + str.slice(1);
  const camelize = (str: string) => {
    return str.replace(/-(\w)/g, (_, c: string) => {
      return c ? c.toLowerCase() : "";
    });
  };
  const getHandlerKey: any = (str: string) => {
    return str ? "on" + capitalize(str) : "";
  };
  const key = getHandlerKey(camelize(eventName));
  const handler = props[key];
  handler && handler(...args);
}
