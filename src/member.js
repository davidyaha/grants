// @flow

import { Set } from 'immutable';
import { compose, composeAll, applyAll, identity } from './utils';
import { getGrantsByMember } from './grant';
import { getRolesByMember } from './role';
import type { Map } from 'immutable';
import type { Grant } from './grant';
import type { Role } from './role';
import type { Store } from './store';

export type Members = Set<any> | Array<any> | string;

const expandMembers = (roles: Map<string, Role>) => compose(
  ([member, roles]) => [member, ...(roles.toArray())],
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
