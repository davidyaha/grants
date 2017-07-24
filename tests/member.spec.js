// @flow

import grants from '../src';

const privilegedUser = {
  _id: 'the1',
  name: 'neo',
};

const nonPrivilegedUser = {
  _id: 'MrAnderson',
  name: 'Thomas A. Anderson',
};

const machineUser = {
  _id: 'AgentSmith',
  name: 'Agent Smith',
};

describe('member', () => {
  afterEach(() => {
    grants.clear();
  });

  it('should allow me to get all grants for a member', () => {
    const humanUsers = [privilegedUser._id, nonPrivilegedUser._id];
    grants.grant(humanUsers, 'posts', ['read', 'create']);
    grants.grant(privilegedUser._id, ['users', privilegedUser._id], ['read', 'update', 'delete']);
    grants.grant(machineUser._id, 'posts', ['read', 'create']);

    const expected = [
      { members: humanUsers, resources: ['posts'], attributes: ['read', 'create'] },
      { members: [privilegedUser._id], resources: ['users', privilegedUser._id], attributes: ['read', 'update', 'delete'] },
    ];
    const setOfGrants = grants.member(privilegedUser._id);
    expect(setOfGrants).toBeInstanceOf(Array);
    expect(setOfGrants).toHaveLength(2);
    expect(setOfGrants).toEqual(expect.arrayContaining(expected));
  });
});