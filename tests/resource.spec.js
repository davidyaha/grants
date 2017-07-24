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

describe('resource', () => {
  afterEach(() => {
    grants.clear();
  });

  it('should allow me to get the all grants for resource', () => {
    const humanUsers = [privilegedUser._id, nonPrivilegedUser._id];
    grants.grant(humanUsers, 'posts', ['read', 'create']);

    const setOfGrants = grants.resource('posts');
    expect(setOfGrants).toBeInstanceOf(Array);
    expect(setOfGrants).toHaveLength(1);
    expect(setOfGrants[0]).toHaveProperty('resources', ['posts']);
    expect(setOfGrants[0]).toHaveProperty('attributes', ['read', 'create']);
    expect(setOfGrants[0]).toHaveProperty('members', humanUsers);
  });

  it('should allow me to get the all grants of type for resource', () => {
    const humanUsers = [privilegedUser._id, nonPrivilegedUser._id];
    grants.grant(machineUser._id, 'posts', ['create']);
    grants.grant(humanUsers, 'posts', ['read', 'create']);

    let setOfGrants = grants.resource('posts', 'read');
    expect(setOfGrants).toBeInstanceOf(Array);
    expect(setOfGrants).toHaveLength(1);
    expect(setOfGrants[0]).toHaveProperty('resources', ['posts']);
    expect(setOfGrants[0]).toHaveProperty('attributes', ['read', 'create']);
    expect(setOfGrants[0]).toHaveProperty('members', humanUsers);

    const expected = [
      { members: humanUsers, resources: ['posts'], attributes: ['read', 'create'] },
      { members: [machineUser._id], resources: ['posts'], attributes: ['create'] },
    ];
    setOfGrants = grants.resource('posts', 'create');
    expect(setOfGrants).toBeInstanceOf(Array);
    expect(setOfGrants).toHaveLength(2);
    expect(setOfGrants).toEqual(expect.arrayContaining(expected));
  });
});