// @flow

import { isSameRole } from './role';
import { getRole } from './get';
import { compose, composeAll, applyAll, applyIf, identity, selectLast } from '../utils';

import type { Set, Map } from 'immutable';
import type { Role } from './role';
import type { Store } from '../store';
import type { Grant } from '../grant';

export const grantHaveRole = (role: Role) => (grant: Grant) =>
  !!grant.members.find(isSameRole(role));

export const deleteRoleOnGrantMembers = (role: Role) => (members: Set<any>) =>
  composeAll(
    members.delete.bind(members),
    members.find.bind(members, isSameRole(role)),
  )(members);

export const updateRoleOnGrant = (role: Role) => (grant: Grant) =>
  composeAll(
    grant.set.bind(grant, 'members'),
    (members: Set<any>) => members.add(role),
    deleteRoleOnGrantMembers(role),
  )(grant.members);

export const updateRolesOnGrants = (store: Store) =>
  composeAll(
    store.set.bind(store, 'grants'),
    store.grants.map.bind(store.grants),
    ([haveRole, updateRole]) => applyIf(updateRole)(haveRole),
    applyAll(
      grantHaveRole,
      updateRoleOnGrant,
    ),
  );

export const setRoleToRoles = (roles: Map<string, Role>) =>
  (role: Role) => roles.set(role.name, role);

export const setRoleToStore = (store: Store) => compose(
  store.set.bind(store, 'roles'),
  setRoleToRoles(store.roles),
);

export const addMemberToRole = (roles: Map<string, Role>) =>
  (member: any, role: Role | string) => composeAll(
    ([role, members]) => role.set('members', members),
    applyAll(
      identity,
      (role: Role) => role.members.add(member),
    ),
    getRole(roles),
  )(role);

export const setRole = (stateSetter: Function, store: Store) =>
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
    addMemberToRole(store.roles),
  );