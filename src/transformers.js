// @flow
import { Set } from 'immutable';
import { Role } from './role';
import type { Grant } from './grant';

import type { Members } from './member';

export const membersToSet = (members: Members) =>
  members && (
    Array.isArray(members) || Set.isSet(members) ?
      Set(members) :
      Set.of(members)
  );

const expandWithRole = (set: Set<any>, role: Role) => set.union(role.members || Set());

export const expandSet = (set: Set<any>) => set.reduce(
  (expanded: Set<any>, value: any) =>
    Role.isRole(value) ? expandWithRole(expanded, value) : expanded.add(value),
  Set(),
);

export const setToPermitted = (set: Set<any>) => (value: any) => expandSet(set).has(value);
export const grantToPermitted = (grant: Grant) => setToPermitted(grant.members);