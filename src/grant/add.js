// @flow
import { Grant } from './grant';
import { grantToPermitted } from '../transformers';
import { compose, composeAll, applyAll, selectLast } from '../utils';

import type { Store } from '../store';

const addGrantToStore = (store: Store) => compose(
  store.set.bind(store, 'grants'),
  store.grants.add.bind(store.grants),
);

export const grant = (stateSetter: Function, store: Store) => composeAll(
  selectLast,
  applyAll(
    compose(stateSetter, addGrantToStore(store)),
    grantToPermitted,
  ),
  Grant.lift,
);