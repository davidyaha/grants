// @flow

import { compose, composeAll, applyAll, identity } from '../utils';
import { membersToSet } from '../transformers';
import { Role } from './role';

import type { Map } from 'immutable';
import type { Members } from '../member';

export const getRolesByMember = (roles: Map<string, Role>) => compose(
  (members: Members) => roles.filter((role: Role) => !role.members.intersect(members).isEmpty()),
  membersToSet,
)

export const getRoleByName = (roles: Map<string, Role>) =>
  (roleName: string) => roles.get(roleName, Role.lift(roleName));

export const getRoleName = (role: Role | string) => Role.isRole(role) ? (role: Role).name : role;

export const getRole = (roles: Map<string, Role>) =>
  compose(
    getRoleByName(roles),
    getRoleName,
  );

export const getRoleIfNotEmpty = (roles: Map<string, Role>) => (role: Role) =>
  composeAll(
    ([maybeEmpty, isEmpty]) => !isEmpty ? maybeEmpty : role,
    applyAll(
      identity,
      Role.isEmpty,
    ),
    getRole(roles),
  )(role);

export const getOrCreateRole = (roles: Map<string, Role>) => compose(
  getRoleIfNotEmpty(roles),
  Role.lift,
);