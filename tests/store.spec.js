import grants from '../src';
import { Store } from '../src/store';

describe('Store', () => {
  beforeAll(() => {
    grants.grant('the1', ['posts', 1], ['read', 'update', 'delete']);
    grants.grant('the1', ['posts', 2], ['read', 'update', 'delete']);
    grants.grant('the1', ['posts', 3], 'read');
    grants.grant('the1', ['posts', 4], ['read', 'update', 'delete']);
    grants.grant(['some1', 'the1'], ['posts', 3], ['read', 'delete']);
    grants.grant('some1', ['posts', 2], ['delete']);

    const humansRole = grants.role('humans', 'the1');
    grants.grant(humansRole, 'users', 'read');
    
    const machinesRole = grants.role('machines');
    grants.setRole('bot', 'machines');

    grants.grant(machinesRole, 'users', grants.ALL);
  });

  it('should allow creation from plain js object', () => {
    const pojoStore = grants._store.toJS();
    const liftedStore = Store.lift(pojoStore);
    expect(liftedStore).toEqual(grants._store);
  });
});