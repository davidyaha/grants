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

describe('roles', () => {
  afterEach(() => {
    grants.clear();
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
    const humanRole = grants.role('human', humanUsers);
    const machineRole = grants.role('machine', machineUser);
    grants.grant(humanRole, 'posts', ['read', 'create']);
    grants.grant([humanRole, machineRole], 'posts', ['delete']);
    grants.grant(humanRole, 'posts', ['update']);
    grants.grant(privilegedUser._id, ['users', privilegedUser._id], ['read', 'update', 'delete']);
    grants.grant(machineUser._id, 'posts', ['read', 'create']);

    const expected = [
      { members: [humanRole.toJS()], resources: ['posts'], attributes: ['read', 'create'] },
      { members: [humanRole.toJS()], resources: ['posts'], attributes: ['update'] },
      { members: [humanRole.toJS(), machineRole.toJS()], resources: ['posts'], attributes: ['delete'] },
    ];
    const setOfGrants = grants.member(humanRole);
    expect(setOfGrants).toBeInstanceOf(Array);
    expect(setOfGrants).toHaveLength(3);
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

  it('should allow me to remove permissions for roles', () => {
    const humanUsers = [privilegedUser._id, nonPrivilegedUser._id];
    const humanRole = grants.role('human', humanUsers);
    const machineRole = grants.role('machine', machineUser._id);
    grants.grant([humanRole, machineRole], 'posts', ['read', 'create']);
    
    let permitted = grants.get('posts', 'create');
    expect(permitted(nonPrivilegedUser._id)).toBe(true);
    expect(permitted(privilegedUser._id)).toBe(true);

    grants.deny(humanRole, 'posts', 'create');
    permitted = grants.get('posts', 'create');
    expect(permitted(nonPrivilegedUser._id)).toBe(false);
    expect(permitted(privilegedUser._id)).toBe(false);
    expect(permitted(machineUser._id)).toBe(true);

    permitted = grants.get('posts', 'read');
    expect(permitted(nonPrivilegedUser._id)).toBe(true);
    expect(permitted(privilegedUser._id)).toBe(true);
    expect(permitted(machineUser._id)).toBe(true);

    grants.deny(humanRole, 'posts', 'read');
    
    permitted = grants.get('posts', 'read');
    expect(permitted(nonPrivilegedUser._id)).toBe(false);
    expect(permitted(privilegedUser._id)).toBe(false);
    expect(permitted(machineUser._id)).toBe(true);

    grants.deny(machineRole, 'posts', 'read');
    
    permitted = grants.get('posts', ['read']);
    expect(permitted(machineUser._id)).toBe(false);
    
    permitted = grants.get('posts', 'create');
    expect(permitted(machineUser._id)).toBe(true);

    grants.deny(machineRole, 'posts', 'create');
    
    permitted = grants.get('posts', 'create');
    expect(permitted(machineUser._id)).toBe(false);
  });

  it('should allow me to unset user in certain role', () => {
    const humanUsers = [privilegedUser._id, nonPrivilegedUser._id];
    const role = grants.role('human', humanUsers);
    grants.grant(role, 'posts', ['read', 'create']);

    let permitted = grants.get('posts', 'create');
    expect(permitted(privilegedUser._id)).toBe(true);
    expect(permitted(nonPrivilegedUser._id)).toBe(true);
    expect(permitted(machineUser._id)).toBe(false);

    grants.unsetRole(nonPrivilegedUser._id, role);
    permitted = grants.get('posts', 'create');
    expect(permitted(privilegedUser._id)).toBe(true);
    expect(permitted(nonPrivilegedUser._id)).toBe(false);
  });
});