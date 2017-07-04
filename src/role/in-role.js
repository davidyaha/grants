// @flow

import { Role } from './role';
import { getRoleByName } from './get';
import { compose } from '../utils';

const isInRole = (role: Role) => (member: any) => !Role.isEmpty(role) && role.members.has(member);

export const inRole = (roles: Map<string, Role>) => compose(
  isInRole,
  getRoleByName(roles),
);