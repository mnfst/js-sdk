# CASE Client

CASE Client SDK for the web.

## Usage

```js
import Client from @casejs/client

// Initialize client SDK.
const cs = new Client();

// Get cats.
const cats = await cs.from('cats').find()

// Get a cat.
const cat = await cs.from('cats').findOne(1)

// Create a cat.
const newCat = await cs.from('cats').create({
    name: 'Tom',
    age: 5
})

// Update a cat.
const updatedCat = await cs.from('cats').update(2, {
    name: 'Updated name',
    age: 6
})

// Delete a cat.
await cs.from('cats').delete(2)

// Login as a user (requires having a User authenticable entity).
await cs.login('users', 'user1@case.app', 'case');

// Sign up.
await cs.signup('users', 'user1@case.app', 'case');

// Login as an admin.
await cs.login('admins', 'admin@case.app', 'case')

// Logout.
await cs.logout()
```
