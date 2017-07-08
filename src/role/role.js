// @flow

import { Record, Set } from 'immutable';
import { membersToSet } from '../transformers';
import { compose, composeAll, applyAll, identity, selectLast } from '../utils';
import { getOrCreateRole } from './get';
import { setRoleToStore } from './set';

import type { Store } from '../store';
import type { Members } from '../member';

export const Role = Record({
  name: '',
  members: Set(),
}, 'Role');

Role.lift = (name: string, members: Members) => new Role({
  name,
  members: membersToSet(members) || Set(),
});

Role.isRole = (role: Role) => role && role._name === 'Role';

Role.isEmpty = (role: Role) => !role.members || role.members.isEmpty();

export const isSameRole = (role: Role) => (member: any) =>
  (Role.isRole(member) && (member.name === role.name));

export const role = (stateSetter: Function, store: Store) =>
  composeAll(
    selectLast,
    applyAll(
      compose(stateSetter, setRoleToStore(store)),
      identity,
    ),
    getOrCreateRole(store.roles),
  );
