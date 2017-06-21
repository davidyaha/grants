// @flow

import { composeAll, all, applyIf } from '../utils';
import { grantHaveMembers, grantHaveResources, grantHaveAttributes  } from './grant';

import type { Grant } from './grant';
import type { Store } from '../store';
import type { Members } from '../transformers';


const shouldBeDenied = (members: Members, resources: Members, attributes: Members) => all(
  grantHaveMembers(members),
  grantHaveResources(resources),
  grantHaveAttributes(attributes),
)

const denyMemebersOfGrant = (members: Members) =>
  (grant: Grant) => grant.set('members', grant.members.subtract(members));

const denyForStore = (members: Members) => (store: Store) =>
  composeAll(
    store.set.bind(store, 'grants'),
    store.grants.map.bind(store.grants),
    applyIf(denyMemebersOfGrant(members)),
  );

export const deny = (stateSetter: Function, store: Store) =>
  (members: Members, resources: Members, attributes: Members) => composeAll(
    stateSetter,
    denyForStore(members)(store),
    shouldBeDenied,
  )(members, resources, attributes);