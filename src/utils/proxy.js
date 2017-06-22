// @flow

const wrapMember = (handler: Object) =>
  (target: Object) =>
    (property: string) =>
      handler.get(target, property);

export const proxy = (handler: Object) => (target: Object) => {
  if ('Proxy' in global) {
    return new Proxy(target, handler);
  }

  const trap = wrapMember(handler)(target);
  const wrapper = {}
  for (const property in target) {
    wrapper[property] = trap(property);
  }

  return wrapper;
};