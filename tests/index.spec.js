// @flow

import { Set } from 'immutable';
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

describe('grants', () => {
  afterEach(() => {
    grants.clear();
  });

  it('should allow me to specify a grant on any set', () => {
    const humanUsers = [privilegedUser._id, nonPrivilegedUser._id];

    let permission = grants.grant(privilegedUser._id, 'users', ['read']);
    expect(permission).toBeInstanceOf(Function);
    expect(permission(privilegedUser._id)).toBe(true);

    permission = grants.grant(Set(humanUsers), 'users', ['read']);
    expect(permission).toBeInstanceOf(Function);
    expect(permission(privilegedUser._id)).toBe(true);

    permission = grants.grant(humanUsers, 'users', ['read']);
    expect(permission).toBeInstanceOf(Function);
    expect(permission(privilegedUser._id)).toBe(true);
  });

  it('should allow me to grant permissions to attributed resources', () => {
    let permission = grants.grant(privilegedUser._id, ['users', privilegedUser._id], ['read', 'update', 'delete']);
    expect(permission).toBeInstanceOf(Function);
    permission = grants.grant(nonPrivilegedUser._id, ['users', nonPrivilegedUser._id], ['read', 'update', 'delete']);
    expect(permission).toBeInstanceOf(Function);
    permission = grants.grant(machineUser._id, ['users', '*'], ['create', 'read', 'update', 'delete']);
    expect(permission).toBeInstanceOf(Function);
  });

  it('should tell me if a user is permitted to create a resource', () => {
    const humanUsers = [privilegedUser._id, nonPrivilegedUser._id];
    grants.grant(humanUsers, 'posts', ['create']);

    const permitted = grants.get('posts', 'create');
    expect(permitted).toBeInstanceOf(Function);
    expect(permitted(privilegedUser._id)).toBe(true);
  });

  it('should tell me if a user is permitted to read a resource he owns', () => {
    grants.grant(privilegedUser._id, ['users', privilegedUser._id], ['read', 'update', 'delete']);
    const permitted = grants.get(['users', privilegedUser._id], 'read');
    expect(permitted).toBeInstanceOf(Function);
    expect(permitted(privilegedUser._id)).toBe(true);
  });

  it('should tell me if a user is not permitted', () => {
    grants.grant(nonPrivilegedUser._id, 'posts', 'read');
    const permitted = grants.get('posts', 'create');
    expect(permitted).toBeInstanceOf(Function);
    expect(permitted(nonPrivilegedUser._id)).toBe(false);
  });

  it('should allow me to remove permissions', () => {
    const humanUsers = [nonPrivilegedUser._id, privilegedUser._id];
    grants.grant(humanUsers, 'posts', ['read', 'create']);
    let permitted = grants.get('posts', 'create');
    expect(permitted(nonPrivilegedUser._id)).toBe(true);
    expect(permitted(privilegedUser._id)).toBe(true);

    grants.deny([nonPrivilegedUser._id], 'posts', 'create');
    permitted = grants.get('posts', 'create');
    expect(permitted(nonPrivilegedUser._id)).toBe(false);
    expect(permitted(privilegedUser._id)).toBe(true);

    // TODO: Fix this test
    // permitted = grants.get('posts', 'read');
    // expect(permitted(nonPrivilegedUser._id)).toBe(true);
    // expect(permitted(privilegedUser._id)).toBe(true);
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

  it('should allow me to set a name to a Set of users (role)', () => {
    const humanUsers = [privilegedUser._id, nonPrivilegedUser._id];
    const role = grants.role('human', humanUsers);
    grants.grant(role, 'posts', ['read', 'create']);

    let permitted = grants.get('posts', 'create');
    expect(permitted).toBeInstanceOf(Function);
    expect(permitted(privilegedUser._id)).toBe(true);
    expect(permitted(machineUser._id)).toBe(false);

    grants.setRole(machineUser._id, role);
    permitted = grants.get('posts', 'create');
    expect(permitted(machineUser._id)).toBe(true);
  });

  it('should allow me to get role by not specifying members', () => {
    const humanUsers = [privilegedUser._id, nonPrivilegedUser._id];
    grants.role('human', humanUsers);

    const role = grants.role('human');
    expect(role.name).toBe('human');
    expect(role.members.toJS()).toEqual(humanUsers);
  });

  it('should allow me to define a role without members and add to it in later time', () => {
    const humanUsers = [privilegedUser._id, nonPrivilegedUser._id];
    let humanRole = grants.role('human');
    let machineRole = grants.role('machine');
    expect(humanRole.name).toBe('human');
    expect(humanRole.members).toBe(Set());
    expect(machineRole.name).toBe('machine');
    expect(machineRole.members).toBe(Set());

    grants.grant(humanRole, 'posts', ['create', 'read']);
    grants.grant(machineRole, 'posts', 'read');

    grants.setRole(privilegedUser._id, 'human');
    grants.setRole(nonPrivilegedUser._id, 'human');
    grants.setRole(machineUser._id, machineRole);

    const role = grants.role('human');
    expect(role.name).toBe('human');
    expect(role.members.toJS()).toEqual(humanUsers);

    const permittedToReadPosts = grants.get('posts', 'read');
    expect(permittedToReadPosts(privilegedUser._id)).toBe(true);
    expect(permittedToReadPosts(nonPrivilegedUser._id)).toBe(true);
    expect(permittedToReadPosts(machineUser._id)).toBe(true);

    const permittedToCreatePosts = grants.get('posts', 'create');
    expect(permittedToCreatePosts(privilegedUser._id)).toBe(true);
    expect(permittedToCreatePosts(nonPrivilegedUser._id)).toBe(true);
    expect(permittedToCreatePosts(machineUser._id)).toBe(false);

  });

  it('should allow me to get all grants for a certain role', () => {
    const humanUsers = [privilegedUser._id, nonPrivilegedUser._id];
    const role = grants.role('human', humanUsers);
    grants.grant(role, 'posts', ['read', 'create']);
    grants.grant(privilegedUser._id, ['users', privilegedUser._id], ['read', 'update', 'delete']);
    grants.grant(machineUser._id, 'posts', ['read', 'create']);

    const expected = [
      { members: [role.toJS()], resources: ['posts'], attributes: ['read', 'create'] },
    ];
    const setOfGrants = grants.member(role);
    expect(setOfGrants).toBeInstanceOf(Array);
    expect(setOfGrants).toHaveLength(1);
    expect(setOfGrants).toEqual(expect.arrayContaining(expected));
  });

  it('should allow me to get all grants for a user within role', () => {
    const humanUsers = [privilegedUser._id, nonPrivilegedUser._id];
    const role = grants.role('human', humanUsers);
    grants.grant(role, 'posts', ['read', 'create']);
    grants.grant(privilegedUser._id, ['users', privilegedUser._id], ['read', 'update', 'delete']);
    grants.grant(machineUser._id, 'posts', ['read', 'create']);

    const expected = [
      { members: [role.toJS()], resources: ['posts'], attributes: ['read', 'create'] },
      { members: [privilegedUser._id], resources: ['users', privilegedUser._id], attributes: ['read', 'update', 'delete'] },
    ];
    const setOfGrants = grants.member(privilegedUser._id);
    expect(setOfGrants).toBeInstanceOf(Array);
    expect(setOfGrants).toHaveLength(2);
    expect(setOfGrants).toEqual(expect.arrayContaining(expected));
  });

  it('should allow me to check if a user is within role using the role name', () => {
    const humanUsers = [privilegedUser._id, nonPrivilegedUser._id];
    grants.role('human', humanUsers);

    const isAHuman = grants.inRole('human');
    expect(isAHuman).toBeInstanceOf(Function);
    expect(isAHuman(privilegedUser._id)).toBe(true);
    expect(isAHuman(machineUser._id)).toBe(false);
  });

  it('should allow me to check if a user is within role using the role name even if the role was not defined', () => {
    const isAHuman = grants.inRole('human');
    expect(isAHuman).toBeInstanceOf(Function);
    expect(isAHuman(privilegedUser._id)).toBe(false);
    expect(isAHuman(machineUser._id)).toBe(false);
  });

  it('should allow me to define super users', () => {
    const superUser = { _id: 'clark kent' };
    const role = grants.role('admin', superUser._id);

    grants.grant(role, grants.ALL, grants.ALL);

    grants.grant(machineUser._id, 'posts', ['read', 'create']);
    grants.grant(privilegedUser._id, ['users', privilegedUser._id], ['read', 'update', 'delete']);

    let permitted = grants.get('posts', 'read');
    expect(permitted(superUser._id)).toBe(true);

    permitted = grants.get(['users', privilegedUser._id], 'delete');
    expect(permitted(superUser._id)).toBe(true);
  });
});
