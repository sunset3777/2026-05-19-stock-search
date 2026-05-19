# GitHub Development Workflow

## Branching

Use short-lived branches for development:

- `feature/**` for product and frontend changes
- `agent/**` for Agent workflow, automation, or AI-assisted changes

Pushes to these branch patterns trigger the Auto PR workflow.

## Pull Request Flow

1. Create or push a `feature/**` or `agent/**` branch.
2. `.github/workflows/auto-pr.yml` creates a pull request to `main` if one does not already exist.
3. CI runs lint, typecheck, and build checks.
4. Security workflow runs `npm audit --audit-level=high`.
5. CodeRabbit reviews the pull request when the GitHub App is installed.
6. Vercel GitHub Integration creates a Preview Deployment for the pull request.
7. After review and checks pass, merge into `main`.
8. Vercel deploys Production from `main`.

## Required Checks

Use these checks as the merge gate for `main`:

- `ci`
- `npm-audit`

## Recommended Branch Protection

Enable branch protection for `main` in GitHub repository settings:

- Require a pull request before merging.
- Require status checks to pass before merging.
- Require branches to be up to date before merging.
- Block force pushes.
- Block deletions.

## Code Review

CodeRabbit is configured through `.coderabbit.yaml`.

Repository setup still requires installing the CodeRabbit GitHub App. Without the app installation, the configuration file does not create reviews by itself.

## Deployment Ownership

Deployment is owned by Vercel GitHub Integration.

Do not add Vercel CLI deployment workflows unless the project explicitly decides to move deployment control back into GitHub Actions.
