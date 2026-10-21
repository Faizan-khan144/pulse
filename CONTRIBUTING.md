# Contributing to Pulse

Thanks for taking a look. Pulse is intentionally small, so the bar for a change is simple: it should make the chat clearer, faster or more honest.

## Local setup

```bash
cd server && npm install && cp .env.example .env && npx prisma db push && npm run db:seed
cd ../client && npm install
```

Run `npm run dev` in both folders. The client expects the API on port 4100, which is the default.

## Before you open a pull request

- Keep the change focused. One concern per pull request.
- Run `npm run build` in `client/` and make sure `server` still boots (`npm start` after seeding).
- Include a screenshot or short recording for UI changes.
- No placeholder products, fake users, fake metrics or invented activity. The demo workspace is the only seeded content and it is labelled as such.
- Keep the light teal visual language. No purple, no gradients that fight the teal accent.
- Do not commit `.env`, `dev.db`, logs or `dist`.
- Comments: the codebase does not use them, so match the surrounding style.

## Commit style

Short imperative subject, present tense, under 72 characters:

```
Add scope section to the landing page
Fix unread badge after switching channels
```

## Reporting bugs

Open an issue with:

1. What you expected.
2. What happened.
3. Steps to reproduce, including whether websockets were available.
4. Browser and Node version.

Security issues go through [SECURITY.md](./SECURITY.md), not the public issue tracker.

## Code layout

- `client/src/pages/Workspace.jsx` owns the chat shell, message list, composer and modals.
- `client/src/index.css` holds design tokens and the animation utilities used by the landing page.
- `server/src/routes/` is the whole HTTP surface. Keep new routes authenticated by default.
- `server/src/index.js` is the Socket.IO server. Keep emitted payloads shaped exactly like the REST responses.

By contributing you agree that your work is released under the MIT license.
