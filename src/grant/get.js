// @flow

import { Set } from 'immutable';
import { grantHaveMembers, grantHaveResources, grantHaveAttributes } from './grant';
import { all } from '../utils';

import type { Grant } from './grant';
import type { Members } from '../member';

export const getGrantsByMember = (grants: Grant) =>
  (members: Members) => grants.filter(
    grantHaveMembers(members),
  );

export const getPermission = (grants: Set<Grant>) =>
  (resources: Members, attributes?: Members) =>
    grants.filter(
      (grant: Grant) => all(grantHaveResources(resources), grantHaveAttributes(attributes))(grant),
    ).reduce(
      (membersSet: Set<any>, grant: Grant) => membersSet.union(grant.members),
      Set(),
    );