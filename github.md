# GitHub Guide

This guide explains how to put Vozilo.ba on GitHub and keep working with it.

## 1. Create A GitHub Repository

On GitHub:

1. Click `New repository`.
2. Repository name:

```text
vozilo.ba
```

3. Choose private or public.
4. Do not initialize with README, `.gitignore`, or license if this local project already has files.
5. Create repository.

GitHub will show a remote URL like:

```text
https://github.com/YOUR_USERNAME/vozilo.ba.git
```

or:

```text
git@github.com:YOUR_USERNAME/vozilo.ba.git
```

## 2. Initialize Git Locally

From the project folder:

```bash
cd C:\programming\vozilo.ba
git init
git add .
git commit -m "Initial Vozilo.ba scaffold"
```

If using PowerShell, the same commands work.

## 3. Connect Local Project To GitHub

Use HTTPS:

```bash
git remote add origin https://github.com/YOUR_USERNAME/vozilo.ba.git
git branch -M main
git push -u origin main
```

Or use SSH:

```bash
git remote add origin git@github.com:YOUR_USERNAME/vozilo.ba.git
git branch -M main
git push -u origin main
```

## 4. Check Remote

```bash
git remote -v
git status
```

Expected status after push:

```text
nothing to commit, working tree clean
```

## 5. Daily Git Workflow

Before starting work:

```bash
git pull
```

Create a branch:

```bash
git checkout -b feature/vehicles
```

Make changes, then check:

```bash
git status
git diff
```

Run verification:

```bash
npm run lint
npm run test
npm run build
```

Commit:

```bash
git add .
git commit -m "Add vehicle management foundation"
git push -u origin feature/vehicles
```

Open a pull request on GitHub.

## 6. Environment Files And Secrets

Do not commit real secrets.

This project includes:

```text
.env.example
.env
.env.local
```

Recommended Git behavior:

- Commit `.env.example`.
- Do not commit production secrets.
- Keep `.env` and `.env.local` local or use safe development-only values.
- Put production secrets in the hosting provider dashboard or on the VPS.

If secrets are accidentally committed:

1. Rotate the secret immediately.
2. Remove it from the repository.
3. Consider rewriting Git history if the repository is public or shared.

## 7. GitHub Actions Later

Add CI later with this behavior:

```text
On pull request:
- npm install
- npm run lint
- npm run test
- npm run build
```

Suggested file:

```text
.github/workflows/ci.yml
```

Example:

```yaml
name: CI

on:
  pull_request:
  push:
    branches:
      - main

jobs:
  verify:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm install
      - run: npm run lint
      - run: npm run test
      - run: npm run build
```

## 8. GitHub To VPS Deployment

On the VPS:

```bash
cd /var/www/vozilo.ba
git pull
docker compose up -d --build
```

For automatic deploys later, use one of these:

- GitHub Actions over SSH
- Coolify
- Dokploy
- Portainer webhook
- Manual `git pull` and `docker compose up -d --build`

Manual deploy is simplest at the beginning.

## Useful Commands

Show current branch:

```bash
git branch
```

Show commit history:

```bash
git log --oneline --decorate --graph --all
```

Undo unstaged changes in one file:

```bash
git restore path/to/file
```

Remove a file from Git but keep it locally:

```bash
git rm --cached path/to/file
```

Change remote URL:

```bash
git remote set-url origin https://github.com/YOUR_USERNAME/vozilo.ba.git
```
