# GitHub Secrets Setup Guide

This guide explains how to configure GitHub Secrets for CI/CD deployment to GCP Cloud Run.

## Overview

**For Production**: All secrets are stored in GitHub Secrets (no `.env` files in production)
**For Development**: Use local `.env` files (never commit these!)

## Required GitHub Secrets

### 1. Core GCP Secrets

```bash
# GCP Project Configuration
gh secret set GCP_PROJECT_ID -b "your-firebase-project-id"
gh secret set GCP_REGION -b "us-central1"

# Workload Identity Federation (preferred for security)
gh secret set GCP_WIF_PROVIDER -b "projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-pool/providers/github-provider"
gh secret set GCP_WIF_SERVICE_ACCOUNT -b "github-actions-deployer@your-project.iam.gserviceaccount.com"
```

### 2. Firebase Secrets (Backend)

```bash
# From your Firebase service account JSON
gh secret set FIREBASE_PROJECT_ID -b "your-firebase-project-id"
gh secret set FIREBASE_CLIENT_EMAIL -b "firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"
gh secret set FIREBASE_PRIVATE_KEY -b "-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
-----END PRIVATE KEY-----"
```

**Note**: For multiline private key, use:
```bash
gh secret set FIREBASE_PRIVATE_KEY < private-key.txt
```

### 3. Google OAuth Secrets (API)

```bash
# From Google Cloud Console → Credentials
gh secret set GOOGLE_CLIENT_ID -b "123456789-abcdefg.apps.googleusercontent.com"
gh secret set GOOGLE_CLIENT_SECRET -b "GOCSPX-YourSecretHere"
```

### 4. OpenAI Secret

```bash
# From OpenAI Platform
gh secret set OPENAI_API_KEY -b "sk-proj-YourOpenAIKeyHere"
```

### 5. Redis Secrets

```bash
# For Cloud Memorystore or managed Redis
gh secret set REDIS_HOST -b "10.x.x.x"  # or redis.example.com
gh secret set REDIS_PORT -b "6379"
gh secret set REDIS_PASSWORD -b "your-redis-password"  # if using auth
```

### 6. API Configuration Secrets

```bash
# CORS allowed origins (comma-separated)
gh secret set CORS_ORIGINS -b "https://app.preplyai.com,https://app-staging.preplyai.com"

# Session secret (generate random string)
gh secret set SESSION_SECRET -b "$(openssl rand -hex 64)"
```

### 7. Frontend (Web) Secrets

```bash
# Firebase Web Config (from Firebase Console → Project Settings → Web App)
gh secret set VITE_FIREBASE_API_KEY -b "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
gh secret set VITE_FIREBASE_AUTH_DOMAIN -b "your-project.firebaseapp.com"
gh secret set VITE_FIREBASE_PROJECT_ID -b "your-firebase-project-id"
gh secret set VITE_FIREBASE_STORAGE_BUCKET -b "your-project.appspot.com"
gh secret set VITE_FIREBASE_MESSAGING_SENDER_ID -b "123456789"
gh secret set VITE_FIREBASE_APP_ID -b "1:123456789:web:abcdef123456"
gh secret set VITE_FIREBASE_MEASUREMENT_ID -b "G-XXXXXXXXXX"

# API URL (will be your deployed API Cloud Run URL)
gh secret set VITE_API_BASE_URL -b "https://preplyai-api-xxxxx.run.app"
```

## Setting Secrets via GitHub UI

Alternative to CLI:

1. Go to your repository on GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Enter name and value
5. Click **Add secret**

## Environment-Specific Secrets

For staging vs production differences:

1. Create environments:
   - Settings → Environments → **New environment**
   - Create `staging` and `production`

2. Add environment-specific secrets:
   - In each environment, add secrets that override repository secrets
   - Example: `VITE_API_BASE_URL` different for staging/prod

## Verify Secrets Are Set

```bash
# List all repository secrets (values are hidden)
gh secret list

# Should show:
# CORS_ORIGINS                    Updated 2025-10-10
# FIREBASE_CLIENT_EMAIL           Updated 2025-10-10
# FIREBASE_PRIVATE_KEY            Updated 2025-10-10
# FIREBASE_PROJECT_ID             Updated 2025-10-10
# GCP_PROJECT_ID                  Updated 2025-10-10
# GCP_REGION                      Updated 2025-10-10
# GCP_WIF_PROVIDER                Updated 2025-10-10
# GCP_WIF_SERVICE_ACCOUNT         Updated 2025-10-10
# GOOGLE_CLIENT_ID                Updated 2025-10-10
# GOOGLE_CLIENT_SECRET            Updated 2025-10-10
# OPENAI_API_KEY                  Updated 2025-10-10
# REDIS_HOST                      Updated 2025-10-10
# REDIS_PASSWORD                  Updated 2025-10-10
# REDIS_PORT                      Updated 2025-10-10
# SESSION_SECRET                  Updated 2025-10-10
# VITE_API_BASE_URL               Updated 2025-10-10
# VITE_FIREBASE_API_KEY           Updated 2025-10-10
# VITE_FIREBASE_APP_ID            Updated 2025-10-10
# VITE_FIREBASE_AUTH_DOMAIN       Updated 2025-10-10
# VITE_FIREBASE_MEASUREMENT_ID    Updated 2025-10-10
# VITE_FIREBASE_MESSAGING_SENDER_ID Updated 2025-10-10
# VITE_FIREBASE_PROJECT_ID        Updated 2025-10-10
# VITE_FIREBASE_STORAGE_BUCKET    Updated 2025-10-10
```

## Security Best Practices

### ✅ DO:
- Use Workload Identity Federation (no service account keys)
- Rotate secrets regularly
- Use environment-specific secrets for staging/prod
- Set minimal IAM permissions
- Use GitHub environment protection rules for production

### ❌ DON'T:
- Commit `.env` files to git
- Use service account JSON keys in GitHub (use WIF instead)
- Share secrets in plain text
- Use same secrets for staging and production
- Hard-code secrets in source code

## Development vs Production

| Environment | Secret Storage | How to Use |
|-------------|---------------|------------|
| **Development** | Local `.env` files | `cp .env.example .env` then edit |
| **CI/CD (GitHub Actions)** | GitHub Secrets | Automatically injected in workflows |
| **Production (Cloud Run)** | GitHub Secrets → Env vars | Set via `--set-env-vars` in deploy |

## Workload Identity Federation Setup

Instead of using service account keys, use WIF (more secure):

### 1. Create Workload Identity Pool

```bash
gcloud iam workload-identity-pools create github-pool \
  --location=global \
  --display-name="GitHub Actions Pool"
```

### 2. Create Provider

```bash
gcloud iam workload-identity-pools providers create-oidc github-provider \
  --location=global \
  --workload-identity-pool=github-pool \
  --issuer-uri=https://token.actions.githubusercontent.com \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
  --attribute-condition="assertion.repository=='YOUR_GITHUB_ORG/YOUR_REPO'"
```

### 3. Create Service Account

```bash
gcloud iam service-accounts create github-actions-deployer \
  --display-name="GitHub Actions Deployer"
```

### 4. Grant Permissions

```bash
# Allow GitHub Actions to impersonate service account
gcloud iam service-accounts add-iam-policy-binding \
  github-actions-deployer@YOUR_PROJECT.iam.gserviceaccount.com \
  --role=roles/iam.workloadIdentityUser \
  --member="principalSet://iam.googleapis.com/projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-pool/attribute.repository/YOUR_GITHUB_ORG/YOUR_REPO"

# Grant Cloud Run permissions
gcloud projects add-iam-policy-binding YOUR_PROJECT \
  --member=serviceAccount:github-actions-deployer@YOUR_PROJECT.iam.gserviceaccount.com \
  --role=roles/run.admin

gcloud projects add-iam-policy-binding YOUR_PROJECT \
  --member=serviceAccount:github-actions-deployer@YOUR_PROJECT.iam.gserviceaccount.com \
  --role=roles/iam.serviceAccountUser
```

## Troubleshooting

### Secret not found in workflow
- Check secret name matches exactly (case-sensitive)
- Verify secret is set at repository or environment level
- Check if environment protection rules are blocking access

### Invalid private key format
- Ensure newlines are preserved in multiline secrets
- Use `gh secret set NAME < file.txt` for multiline content
- Verify no extra quotes or escape characters

### WIF authentication failed
- Check workload identity pool and provider are created
- Verify attribute condition matches your repository
- Ensure service account has necessary IAM roles

## Reference

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation)
- [GitHub CLI](https://cli.github.com/manual/gh_secret_set)

