// @flow

import { compose, composeAll, selectLast, identity, applyAll } from '../utils';
import { getRole } from './get';
import { setRoleToStore, updateRolesOnGrants } from './set';

import type { Map } from 'immutable';
import type { Store } from '../store';
import type { Role } from './role';

export const removeMemberFromRole = (roles: Map<string, Role>) =>
  (member: any, role: Role | string) => composeAll(
    ([role, members]) => role.set('members', members),
    applyAll(
      identity,
      (role: Role) => role.members.delete(member),
    ),
    getRole(roles),
  )(role);

export const unsetRole = (stateSetter: Function, store: Store) =>
  composeAll(
    selectLast,
    applyAll(
      compose(stateSetter, ([state, role]) => updateRolesOnGrants(state)(role)),
      compose(identity, selectLast),
    ),
    applyAll(
      setRoleToStore(store),
      identity,
    ),
    removeMemberFromRole(store.roles),
  );
  