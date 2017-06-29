// @flow

import grants from '../../src';

describe('getMany', () => {
  beforeAll(() => {
    grants.grant('the1', ['posts', 1], ['read', 'update', 'delete']);
    grants.grant('the1', ['posts', 2], ['read', 'update', 'delete']);
    grants.grant('the1', ['posts', 3], 'read');
    grants.grant('the1', ['posts', 4], ['read', 'update', 'delete']);
    grants.grant(['some1', 'the1'], ['posts', 3], ['read', 'delete']);
    grants.grant('some1', ['posts', 2], ['delete']);
  });

  afterAll(() => grants.clear());

  it('should tell me if a user is permitted to do many different resources on single action', () => {
    const permitted = grants.getMany([
      ['posts', 1],
      ['posts', 2],
      ['posts', 3],
      ['posts', 4],
    ], 'read');

    expect(permitted).toBeInstanceOf(Function);
    expect(permitted('the1')).toBe(true);
    expect(permitted('some1')).toBe(false);
  });

  it('should have all or nothing logic, so that users are permitted to all resources or none at all', () => {
    const permitted = grants.getMany([
      ['posts', 1],
      ['posts', 2],
      ['posts', 3],
      ['posts', 4],
    ], 'update');

    expect(permitted).toBeInstanceOf(Function);
    expect(permitted('the1')).toBe(false);
    expect(permitted('some1')).toBe(false);
  });
});