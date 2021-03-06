// @flow

import { Set } from 'immutable';
import { proxy } from './proxy';
import { compose } from './utils';

const methods = {
  isSubset: () => false,
  isSuperset: () => true,
  has: () => true,
  includes: () => true,
  union: function () { return this },
  intersect: (other: Set<any>, ...others) => others.length >= 1 ? other.intersect(...others) : other,
  subtract: () => { throw new Error('Not Implemented')},
  toJS: () => ({ universal: true }),
};

const handler = (methods: Object) => ({
  get: (target: Object, property: string) =>
    methods[property] || target[property]
});

const createSetProxy = compose(
  proxy,
  handler,
);

export const UniversalSet = () => {
  const set = Set();
  const setProxy = createSetProxy(methods);
  return setProxy(set);
};
