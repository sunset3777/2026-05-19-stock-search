# Vercel GitHub Integration

## Deployment Model

This project uses Vercel GitHub Integration for deployment.

GitHub Actions should not deploy to Vercel directly. CI workflows are responsible for validation only, while Vercel handles preview and production deployments from the connected GitHub repository.

## Branch Behavior

- `main` is the production branch.
- Pull requests and non-production branches create Preview Deployments.
- Merges or pushes to `main` create Production Deployments.

## Vercel Project Settings

Use these settings when importing the repository in Vercel:

- Framework Preset: `Next.js`
- Production Branch: `main`
- Build Command: Vercel default for Next.js
- Install Command: Vercel default
- Output Directory: Vercel default for Next.js

## Required Secrets

No GitHub Actions deployment secrets are required for this setup.

Do not add these secrets unless the project later switches back to Vercel CLI deployment through GitHub Actions:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## Verification

After connecting the repository to Vercel:

- Open a pull request and confirm Vercel creates a Preview Deployment.
- Merge a pull request into `main` and confirm Vercel creates a Production Deployment.
- Confirm GitHub Actions only runs validation workflows and does not run Vercel CLI deployment.
