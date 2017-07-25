// @flow

import { Set } from 'immutable';
import { compose, composeAll, all, applyAll, applyIf, selectLast } from '../utils';
import { Grant, grantHaveMembers, grantHaveResources, grantHaveAttributes } from './grant';

import type { Store } from '../store';

const shouldBeDenied = (grant: Grant) => all(
  grantHaveMembers(grant.members),
  grantHaveResources(grant.resources),
  grantHaveAttributes(grant.attributes),
);

const splitByFilter = <T>(set: Set<T>) => (filter: Function) => ([
  set.filter(filter),
  set.filterNot(filter),
]);

const createLeftoverGrant = (prop: string) => (denyGrant: Grant) =>
  (grant: Grant) => composeAll(
    applyIf(
      leftover => Set.of(grant.set(prop, leftover)),
      Set(),
    )(leftover => !leftover.isEmpty()),
    (set: Set<any>) => set.subtract(denyGrant.get(prop)),
    (grant: Grant) => grant.get(prop),
  )(grant);

const createDenyReducer = compose(
  (leftoverCreators: Function[]) =>
    (grantSet: Set<Grant>, grant: Grant) => grantSet.union(
      ...leftoverCreators.map(createLeftover => createLeftover(grant)),
    ),
  applyAll(
    createLeftoverGrant('members'),
    createLeftoverGrant('resources'),
    createLeftoverGrant('attributes'),
  ),
);

const denyAndStore = (store: Store) => (denyGrant: Grant) => composeAll(
  store.set.bind(store, 'grants'),
  ([changed, unchanged]) => changed.union(unchanged),
  applyAll(
    ([staged]) => staged.reduce(createDenyReducer(denyGrant), Set()),
    selectLast,
  ),
  splitByFilter(store.grants),
  shouldBeDenied,
)(denyGrant);

export const deny = (stateSetter: Function, store: Store) => composeAll(
  stateSetter,
  denyAndStore(store),
  Grant.lift,
);