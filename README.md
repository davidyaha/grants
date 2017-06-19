# Grants

Grants is a metadata store for permissions business logic.

It allows you to have the flexibility to grant or deny users of access to any kind of resource.
While access, can be whatever attribute you'd like.

Grants utilizes sets as it's main data structure. **Core assumption**: For any given resource set, there is a set of members that is granted a set of access attributes.

Any permissions that was not given to a member is not permitted.

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