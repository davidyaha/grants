import { Set, Map, Record, fromJS } from 'immutable';
import { Grant } from './grant';
import { Role } from './role';
import { UniversalSet } from './utils';

export const Store = Record({
  grants: Set(),
  roles: Map(),
}, 'Store');

const setOrUniversal = value => value.get('universal') ? UniversalSet() : Set(value);

const revivers = {
  root: value => new Store(value),
  grants: Set,
  roles: Map,
  members: setOrUniversal,
  resources: setOrUniversal,
  attributes: setOrUniversal,
};

Store.lift = store => fromJS(
  store,
  (key, value) => {
    const reviverKey = key === '' ? 'root' : key;
    const reviver = revivers[reviverKey];

    if (reviver) {
      return reviver(value);
    } else if (value.get('name')) {
      return new Role(value);
    } else {
      return new Grant(value);
    }
  }
);