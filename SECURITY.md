# Security

## Supported versions

The `main` branch is the supported version. Fixes land there first.

## Reporting a vulnerability

Please do not open a public issue. Email **muhammadfaizankhan525@gmail.com** with:

- A short description of the issue
- Steps to reproduce
- The affected route, socket event or component
- Any proof of concept you can share safely

You will get a reply within a few days. If the report is valid, a fix and a note in the release commit will follow. Please give a reasonable window before disclosing publicly.

## Scope

In scope:

- Authentication and token handling (`server/src/auth.js`)
- Message and channel authorization (`server/src/routes/*`)
- Reaction, edit and delete ownership checks
- CORS configuration
- Cross-site scripting through message bodies
- Socket authentication

Out of scope:

- Denial of service against your own deployment
- Issues that require a compromised browser or database
- Missing rate limiting on a demo deployment (report it, but it is known)

## Built-in protections

- Passwords are hashed with bcrypt (10 rounds).
- Sessions are signed JWTs with a configurable secret and no server-side session table.
- Every `/api` route except health, signup and login requires a bearer token.
- Editing and deleting a message checks the author.
- React escapes message bodies; the client never injects HTML.
- CORS is restricted through `CLIENT_ORIGIN`.
