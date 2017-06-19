// @flow

import { Record, Set } from 'immutable';
import { membersToSet } from './transformers';
import { compose, composeAll, applyAll, identity, selectLast, echo } from './utils';

import type { Map } from 'immutable';
import type { Store } from './store';
import type { Grant } from './grant';
import type { Members } from './transformers';

export const Role = Record({
  name: '',
  members: Set(),
}, 'Role');

Role.lift = (name: string, members: Members) => new Role({
  name,
  members: membersToSet(members),
});

Role.isRole = (role: Role) => role && role._name === 'Role';

Role.isEmpty = (role: Role) => !role.members || role.members.isEmpty();

const setRoleToRoles = (roles: Map<string, Role>) =>
  (role: Role) => roles.set(role.name, role);

export const getRolesByMember = (roles: Map<string, Role>) => compose(
  (members: Members) => roles.filter((role: Role) => !role.members.intersect(members).isEmpty()),
  membersToSet,
)

const getRoleByName = (roles: Map<string, Role>) =>
  (roleName: string) => roles.get(roleName, Role.lift(roleName));

const getRoleName = (role: Role | string) => Role.isRole(role) ? (role: Role).name : role;

const getRole = (roles: Map<string, Role>) =>
  compose(
    getRoleByName(roles),
    getRoleName,
  );

const isSameRole = (role: Role) => (member: any) =>
  (Role.isRole(member) && (member.name === role.name));

const deleteRoleOnGrantMembers = (role: Role) => (members: Set<any>) =>
  composeAll(
    members.delete.bind(members),
    members.find.bind(members, isSameRole(role)),
  )(members);

const updateRoleOnGrant = (role: Role) => (grant: Grant) =>
  composeAll(
    grant.set.bind(grant, 'members'),
    (members: Set<any>) => members.add(role),
    deleteRoleOnGrantMembers(role),
  )(grant.members);

const updateRolesOnGrants = (store: Store) =>
  composeAll(
    store.set.bind(store, 'grants'),
    store.grants.map.bind(store.grants),
    updateRoleOnGrant,
    getRole(store.roles),
  );

const addMemberToRole = (roles: Map<string, Role>) =>
  (member: any, role: Role | string) => composeAll(
    ([role: Role, members: Set<any>]) => role.set('members', members),
      applyAll(
        identity,
        (role: Role) => role.members.add(member),
      ),
      getRole(roles),
  )(role);

const setRoleToStore = (store: Store) => compose(
  store.set.bind(store, 'roles'),
  setRoleToRoles(store.roles),
);

const getRoleIfNotEmpty = (roles: Map<string, Role>) => (role: Role) =>
  composeAll(
    ([maybeEmpty: Role, isEmpty: boolean]) => !isEmpty ? maybeEmpty : role,
    applyAll(
      identity,
      Role.isEmpty,
    ),
    getRole(roles),
  )(role);

const getOrCreateRole = (roles: Map<string, Role>) => compose(
  getRoleIfNotEmpty(roles),
  Role.lift,
);

export const role = (stateSetter: Function, store: Store) =>
  composeAll(
    selectLast,
    applyAll(
      compose(stateSetter, setRoleToStore(store)),
      identity,
    ),
    getOrCreateRole(store.roles),
  );

export const setRole = (stateSetter: Function, store: Store) =>
  composeAll(
    selectLast,
    applyAll(
      compose(stateSetter, ([state: Store, role: Role]) => updateRolesOnGrants(state)(role)),
      compose(identity, selectLast),
    ),
    applyAll(
      setRoleToStore(store),
      identity,
    ),
    addMemberToRole(store.roles),
  );
