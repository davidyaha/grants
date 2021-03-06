// @flow

import { compose } from './utils';
import { Store } from './store';
import { setToPermitted } from './transformers';
import { grant, deny, getPermission, many } from './grant';
import { role, setRole, unsetRole, inRole } from './role';
import { resource } from './resource';
import { member } from './member';
import { UniversalSet } from './utils';

const grants = {
  _store: new Store(),
  setStore(store: Store) { this._store = store },
  clear() { this._store = new Store() },

  get grant() { return grant(this.setStore.bind(this), this._store) },
  get get() { return compose(setToPermitted, getPermission(this._store.grants)) },
  get getMany() { return compose(setToPermitted, many(this._store.grants)) },
  get deny() { return deny(this.setStore.bind(this), this._store) },
  get role() { return role(this.setStore.bind(this), this._store) },
  get setRole() { return setRole(this.setStore.bind(this), this._store) },
  get unsetRole() { return unsetRole(this.setStore.bind(this), this._store) },
  get inRole() { return inRole(this._store.roles) },
  get resource() { return resource(this._store.grants) },
  get member() { return member(this._store) },

  ALL: UniversalSet(),
};

export default grants;