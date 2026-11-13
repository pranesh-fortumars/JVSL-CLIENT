/*
# Restrict profile table grants to read-only for signed-in users

1. Modified Tables
- `profiles`: removes the default write and read permissions that the platform granted to anonymous visitors and that signed-in users do not need.

2. Security
- Anonymous visitors have no access to profiles.
- Signed-in users can only read their own profile row, enforced by the existing row rule.
- Roles cannot be changed through the website; they are changed only directly in the database.

3. Important Notes
- No data is changed or removed.
*/

REVOKE ALL ON profiles FROM anon;
REVOKE INSERT, UPDATE, DELETE ON profiles FROM authenticated;
