// @flow

import { all } from './utils';
import { grantHaveResources, grantHaveAttributes } from './grant';
import type { Set } from 'immutable';
import type { Grant } from './grant';
import type { Members } from './member';

export const resource = (grants: Set<Grant>) =>
  (resources: Members, attributes?: Members) =>
    grants.filter(
      all(
        grantHaveResources(resources),
        grantHaveAttributes(attributes),
      )
    ).toJS();
