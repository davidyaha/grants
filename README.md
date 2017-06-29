# Grants

Grants is a metadata store for permissions business logic.

It allows you to have the flexibility to grant or deny users of access to any kind of resource.
While access, can be whatever attribute you'd like.

Grants utilizes sets as it's main data structure. **Core assumption**: For any given resource set, there is a set of members that is granted a set of access attributes.

Any permissions that was not given to a member is not permitted.

This package is meant to be a flexible and consice, set of rules, that on top of it, any permissioning model can be implemented.

Permissions are stored in memory so persisting and syncing the permissions metadata is entierly up to the implementor.
This approach allows the implementor to create far more complex permissioning systems then the regular role based system.

For example, you can give permission to user that will expire after a certain time.

## Usage (Most Basic Permissioning Model)

### Granting first permission
```javascript
  grants.grant(privilegedUser._id, ['users', privilegedUser._id], ['read', 'update', 'delete']);
```
### Granting to multiple members
```javascript
  const humanUsers = [privilegedUser._id, nonPrivilegedUser._id];
  grants.grant(humanUsers, 'posts', ['read', 'create']);
```

### Granting permissions to roles
A role is just a tagged set of members in a grant:

```javascript
  const role = grants.role('human', humanUsers);
  grants.grant(role, 'posts', ['read', 'create']);
```

### Checking weather a user is permitted to do something
```javascript
  const permitted = grants.get(['users', privilegedUser._id], 'read');
  permitted(privilegedUser._id) // true
  permitted(nonPrivilegedUser._id) // false
```

### Creatign super/admin users
`grants.ALL` is a universal set. meaning that providing it as resource or attribute on a grant will give the members of this grant access to all resources and/or all attributes (full access). This is usefull for creating admin/super users. 
```javascript
  const superUser = {_id: 'clark kent'};
  const role = grants.role('admin', superUser._id);
  grants.grant(role, grants.ALL, grants.ALL);
  
  const permitted = grants.get(['users', privilegedUser._id], 'read');
  permitted(superUser._id) // true
```

## API

### grant

`grants.grant(members, resources, attributes): Grant` - Call `grant` to add a new grant into the grant store. 

It accepts members set, resources set, and attributes set.

Each of these fields can be an imuutable.js `Set` object, an `Array`, or a single `any` type 

Returns the `Grant` record that was added.

### get

`get(resources, attributes?)` - Call `get` to get a predicate function that allows you to check for a member if it is permitted to access certain resources with certain attributes.

It accepts resources set, and optionaly attributes set.

Returns a predicate function that accepts a member value and returns either true or false.

### getMany

`getMany(resorceList, attributes?)` - Call `getMany` to get a predicate function that allows you to check for a member if it is permitted to access all resources included in the list with certain attributes.

It accepts a list of resources set, and optionaly attributes set.

Returns a predicate function that accepts a member value and returns either true or false.

### deny
### role
### setRole
### resource
### member
