// @flow

import { Set } from 'immutable';
import { compose, composeAll, applyAll, identity } from './utils';
import { getGrantsByMember } from './grant';
import { getRolesByMember } from './role';
import type { Map } from 'immutable';
import type { Grant } from './grant';
import type { Role } from './role';
import type { Store } from './store';

const expandMembers = (roles: Map<string, Role>) => compose(
  ([member: any, roles: Map<string, Role>]) => [member, ...(roles.toArray())],
  applyAll(
    identity,
    getRolesByMember(roles),
  ),
);

export const member = (store: Store) => composeAll(
  (set: Set<Grant>) => set.toJS(),
  getGrantsByMember(store.grants),
  expandMembers(store.roles),
);
