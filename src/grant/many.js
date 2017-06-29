// @flow

import { Set, Map } from 'immutable';
import { applyIf, applyAll, compose, composeAll } from '../utils';
import { grantHaveResources, grantHaveAttributes } from './grant';

import type { Grant } from './grant';
import type { Members } from '../member';

const existInAll = applyIf(
  ([set, ...otherSets]) => otherSets.length > 0 ? set.intersect(...otherSets) : set,
)(
  sets => (sets && Array.isArray(sets) && sets.length > 0)
);

const maybeMapVal = (predicate: Function) =>
  (trueFunc: Function, falseFunc: Function) =>
    (value: any) => predicate(value) ? trueFunc(value) : falseFunc();
const getMembers = grant => grant.members;

const mergeIfExists = (toMergeWith: Set<any>) => (value = Set()) => toMergeWith.union(value);

const curriedSet = (map: Map<any, any>) => (key: any) => (value: any) => map.set(key, value);
const curriedGet = (map: Map<any, any>) => (key: any) => map.get(key);

const getMatchingResources = (resourcesList: Array<Members>) =>
  (grant: Grant) =>
    resourcesList.find(
      resources => grantHaveResources(resources)(grant)
    );

export const many = (grants: Set<Grant>) =>
  compose(
    existInAll,
    (resourcesList: Array<Members>, attributes: Members) =>
      grants.reduce(
        (resourcesToMembers, grant: Grant) => composeAll(
          applyIf(
            ([key, members]) => composeAll(
              curriedSet(resourcesToMembers)(key),
              mergeIfExists(members),
              curriedGet(resourcesToMembers),
            )(key),
          )(
            ([val]) => !!val
          ),
          applyAll(
            getMatchingResources(resourcesList), 
            maybeMapVal(grantHaveAttributes(attributes))(getMembers, Set),
          ),
        )(grant),
        Map(),
      ).toArray(),
  );