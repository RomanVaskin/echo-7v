# SeaSmates production deployment

- Source of truth: `RomanVaskin/echo-7v`, branch `main`.
- Site: `https://seasmates.com` (including `www`).
- Production server: KZ VDSka `213.155.29.140`; previous Beget host `31.207.74.26` is no longer the deployment target.
- App: `/opt/seasmates`, Next.js via `seasmates.service`, bound to `127.0.0.1:3270`.
- Nginx terminates HTTPS and proxies to port 3270.
- PostgreSQL: separate `seasmates` database and role; `/opt/seasmates/.env` is server-local and must never enter Git.
- GitHub Actions: `.github/workflows/deploy.yml` deploys on push to `main` or manual dispatch.
- Repository Actions secrets: `VPS_HOST=213.155.29.140`, `VPS_USER=root`, `VPS_SSH_KEY` (private SSH key corresponding to an authorized server key).
- GitHub Actions checks the server's pinned SSH host key before connecting.
- Deployment: fetch + fast-forward main, `pnpm install --frozen-lockfile`, `pnpm build`, restart service, check `http://127.0.0.1:3270/`.
- Database schema migrations must be run explicitly with `pnpm db:migrate` using the server's `DATABASE_URL`; this workflow does not run migrations.
- Do not edit source files on the production VPS; ship changes via GitHub.
- Beget can be retired after verifying site operations and an automatic deployment on KZ.

Security follow-up: replace root SSH deployment with an unprivileged deployment user when feasible.
