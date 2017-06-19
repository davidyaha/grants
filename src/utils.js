export const all = (...predicates: Array<Function>) =>
  (value: any) =>
    predicates.reduce(
      (result: boolean, predicate: Function) => (result && predicate(value)),
      true,
    );

export const applyAll = (...funcs: Array<Function>) =>
  (...args: Array<any>) =>
    funcs.map(func => func.apply(null, args));

export const compose = (f: Function, g: Function) =>
  (...args: Array<any>) => f(g(...args));

export const composeAll = (...funcs: Array<Function>) =>
  (...args: Array<any>) => {
    const last = funcs.length - 1;
    let ret = args;
    for (let index = last; index >= 0; index--) {
      ret = [funcs[index].apply(null, ret)];
    }
    return ret[0];
  }

export const identity = (value: any) => value;

export const applyIf = (func: Function) =>
  (predicate: Function) =>
    (value: any) =>
      predicate(value) ? func(value) : value;

export const selectLast = (arr: Array<any>) => arr[arr.length - 1];

export const echo = compose(
  selectLast,
  applyAll(
    (...args: any) => console.log('@@Echoing:', ...args),
    identity,
  ),
);