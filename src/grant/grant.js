// @flow
import { Record, Set } from 'immutable';
import { compose } from '../utils';
import { membersToSet } from '../transformers';

import type { Members } from '../member';

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