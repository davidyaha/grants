// @flow
import { Record, Set } from 'immutable';
import { compose, composeAll, applyAll, selectLast, all, applyIf } from './utils';
import { membersToSet, grantToPermitted, expandSet } from './transformers';

import type { Store } from './store';
import type { Members } from './transformers';

export const Grant = Record({
  members: Set(),
  resources: Set(),
  attributes: Set(),
}, 'Grant');

Grant.lift = (members: Members, resources: Members, attributes: Members) => new Grant({
  members: membersToSet(members),
  resources: membersToSet(resources),
  attributes: membersToSet(attributes),
});

const addGrantToStore = (store: Store) => compose(
  store.set.bind(store, 'grants'),
  store.grants.add.bind(store.grants),
);

export const grantHaveMembers = compose(
  (members: Members) => (grant: Grant) => !grant.members.intersect(members).isEmpty(),
  membersToSet,
);

export const grantHaveResources = compose(
  (resources: Members) => (grant: Grant) => grant.resources.isSuperset(resources),
  membersToSet,
);

export const grantHaveAttributes = compose(
  (attributes?: Members) => (grant: Grant) => !attributes || !grant.attributes.intersect(attributes).isEmpty(),
  membersToSet,
);

export const getGrantsByMember = (grants: Grant) =>
  (members: Members) => grants.filter(
    grantHaveMembers(members),
  );

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

export const grant = (stateSetter: Function, store: Store) => composeAll(
  selectLast,
  applyAll(
    compose(stateSetter, addGrantToStore(store)),
    grantToPermitted,
  ),
  Grant.lift,
);

export const deny = (stateSetter: Function, store: Store) =>
  (members: Members, resources: Members, attributes: Members) => composeAll(
    stateSetter,
    denyForStore(members)(store),
    shouldBeDenied,
  )(members, resources, attributes);

export const getPermission = (grants: Set<Grant>) =>
  (resources: Members, attributes?: Members) =>
    grants.filter(
      (grant: Grant) => all(grantHaveResources(resources), grantHaveAttributes(attributes))(grant),
    ).reduce(
      (membersSet: Set<any>, grant: Grant) => membersSet.union(grant.members),
      Set(),
    );