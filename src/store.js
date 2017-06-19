import { Set, Map, Record } from 'immutable';

export const Store = Record({
  grants: Set(),
  roles: Map(),
}, 'Store');