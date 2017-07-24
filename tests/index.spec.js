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
  });
  
});
