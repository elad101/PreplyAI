# Deployment Guide - GCP Cloud Run

This guide covers deploying the API (`apps/api`) and Web (`apps/web`) applications to Google Cloud Platform (GCP) Cloud Run using GitHub Actions with Workload Identity Federation (WIF).

## Table of Contents

- [Prerequisites](#prerequisites)
- [GCP Setup](#gcp-setup)
  - [1. Enable Required APIs](#1-enable-required-apis)
  - [2. Create Artifact Registry](#2-create-artifact-registry)
  - [3. Set up Workload Identity Federation](#3-set-up-workload-identity-federation)
  - [4. Create Service Account](#4-create-service-account)
  - [5. Configure IAM Permissions](#5-configure-iam-permissions)
- [GitHub Setup](#github-setup)
  - [Repository Secrets](#repository-secrets)
  - [Environment Configuration](#environment-configuration)
- [Deployment](#deployment)
- [Post-Deployment](#post-deployment)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- GCP Project with billing enabled
- GitHub repository access with admin permissions
- `gcloud` CLI installed locally (for setup)
- Owner or Editor role in GCP project

## GCP Setup

### 1. Enable Required APIs

Enable the necessary GCP APIs for Cloud Run, Artifact Registry, and IAM:

```bash
# Set your project ID
export GCP_PROJECT_ID="your-project-id"
gcloud config set project $GCP_PROJECT_ID

# Enable APIs
gcloud services enable \
  run.googleapis.com \
  iamcredentials.googleapis.com \
  artifactregistry.googleapis.com \
  cloudresourcemanager.googleapis.com \
  sts.googleapis.com
```

### 2. Create Artifact Registry

Create a Docker repository in Artifact Registry to store container images:

```bash
# Set your preferred region (e.g., us-central1, us-east1, europe-west1)
export GCP_REGION="us-central1"

# Create repository
gcloud artifacts repositories create salesprep \
  --repository-format=docker \
  --location=$GCP_REGION \
  --description="Docker repository for SalesPrep applications"

# Verify creation
gcloud artifacts repositories list --location=$GCP_REGION
```

### 3. Set up Workload Identity Federation

Set up Workload Identity Federation to allow GitHub Actions to authenticate without service account keys:

```bash
# Set your GitHub organization and repository
export GITHUB_ORG="your-github-org"
export GITHUB_REPO="your-repo-name"

# Create Workload Identity Pool
gcloud iam workload-identity-pools create "github-pool" \
  --project="$GCP_PROJECT_ID" \
  --location="global" \
  --display-name="GitHub Actions Pool"

# Get the pool ID
export WORKLOAD_IDENTITY_POOL_ID=$(gcloud iam workload-identity-pools describe "github-pool" \
  --project="$GCP_PROJECT_ID" \
  --location="global" \
  --format="value(name)")

# Create Workload Identity Provider
gcloud iam workload-identity-pools providers create-oidc "github-provider" \
  --project="$GCP_PROJECT_ID" \
  --location="global" \
  --workload-identity-pool="github-pool" \
  --display-name="GitHub Provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" \
  --attribute-condition="assertion.repository_owner == '$GITHUB_ORG'" \
  --issuer-uri="https://token.actions.githubusercontent.com"

# Get the provider resource name (save this for GitHub secrets)
export WIF_PROVIDER=$(gcloud iam workload-identity-pools providers describe "github-provider" \
  --project="$GCP_PROJECT_ID" \
  --location="global" \
  --workload-identity-pool="github-pool" \
  --format="value(name)")

echo "WIF Provider: $WIF_PROVIDER"
```

### 4. Create Service Account

Create a service account for Cloud Run deployments:

```bash
# Create service account
gcloud iam service-accounts create github-actions-deployer \
  --project="$GCP_PROJECT_ID" \
  --display-name="GitHub Actions Deployer" \
  --description="Service account for GitHub Actions to deploy to Cloud Run"

# Get service account email
export SERVICE_ACCOUNT_EMAIL="github-actions-deployer@$GCP_PROJECT_ID.iam.gserviceaccount.com"

echo "Service Account Email: $SERVICE_ACCOUNT_EMAIL"
```

### 5. Configure IAM Permissions

Grant necessary permissions to the service account:

```bash
# Grant Cloud Run Admin role
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
  --role="roles/run.admin"

# Grant Artifact Registry Admin role
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
  --role="roles/artifactregistry.admin"

# Grant Service Account Token Creator role
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
  --role="roles/iam.serviceAccountTokenCreator"

# Grant Service Account User role (needed to deploy Cloud Run services)
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
  --role="roles/iam.serviceAccountUser"

# Allow GitHub Actions to impersonate the service account
gcloud iam service-accounts add-iam-policy-binding $SERVICE_ACCOUNT_EMAIL \
  --project="$GCP_PROJECT_ID" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/${WORKLOAD_IDENTITY_POOL_ID}/attribute.repository/${GITHUB_ORG}/${GITHUB_REPO}"
```

## GitHub Setup

### Repository Secrets

Add the following secrets to your GitHub repository (Settings → Secrets and variables → Actions):

#### Required for Both Workflows

| Secret Name | Description | Example Value |
|------------|-------------|---------------|
| `GCP_PROJECT_ID` | Your GCP Project ID | `my-project-123` |
| `GCP_REGION` | GCP region for deployments | `us-central1` |
| `GCP_WIF_PROVIDER` | Full WIF provider resource name | `projects/123.../locations/global/workloadIdentityPools/github-pool/providers/github-provider` |
| `GCP_WIF_SERVICE_ACCOUNT` | Service account email | `github-actions-deployer@my-project.iam.gserviceaccount.com` |

#### API-Specific Secrets

| Secret Name | Description |
|------------|-------------|
| `REDIS_URL` | Redis connection string |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_PRIVATE_KEY` | Firebase service account private key |
| `FIREBASE_CLIENT_EMAIL` | Firebase service account email |
| `CORS_ORIGINS` | Comma-separated allowed origins |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `OPENAI_API_KEY` | OpenAI API key for AI features |

#### Web-Specific Secrets

| Secret Name | Description |
|------------|-------------|
| `VITE_API_URL` | Backend API URL (Cloud Run service URL) |
| `VITE_FIREBASE_API_KEY` | Firebase web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |
| `VITE_FIREBASE_MEASUREMENT_ID` | Firebase measurement ID (optional) |

### Setting Secrets via CLI

You can use the GitHub CLI to set secrets:

```bash
# Install GitHub CLI if needed: https://cli.github.com/

# Authenticate
gh auth login

# Set secrets (example)
gh secret set GCP_PROJECT_ID -b "$GCP_PROJECT_ID"
gh secret set GCP_REGION -b "$GCP_REGION"
gh secret set GCP_WIF_PROVIDER -b "$WIF_PROVIDER"
gh secret set GCP_WIF_SERVICE_ACCOUNT -b "$SERVICE_ACCOUNT_EMAIL"
```

### Environment Configuration

Configure GitHub Environments for staging and production:

1. Go to repository Settings → Environments
2. Create two environments:
   - `staging`
   - `production`
3. For `production`, add protection rules:
   - Required reviewers (recommended)
   - Deployment branch: `main` only

## Deployment

### Automatic Deployment

Deployments trigger automatically on:

- **Push to `main` branch** → Deploys to **production**
- **Push to `develop` branch** → Deploys to **staging**
- **Push tags (v\*)** → Deploys to **production** with version tag

### Manual Deployment

Trigger manual deployment via GitHub Actions:

1. Go to Actions tab in GitHub
2. Select workflow (`Deploy API to Cloud Run` or `Deploy Web to Cloud Run`)
3. Click "Run workflow"
4. Select branch and environment
5. Click "Run workflow"

### First Deployment

For the first deployment:

1. **Deploy API first** (web depends on API URL):
   ```bash
   git push origin main
   # or manually trigger deploy-api.yml workflow
   ```

2. **Get API URL** from Cloud Run console or workflow output

3. **Update `VITE_API_URL` secret** with the API URL

4. **Deploy Web**:
   ```bash
   git push origin main
   # or manually trigger deploy-web.yml workflow
   ```

## Post-Deployment

### Verify Deployments

Check that services are running:

```bash
# List Cloud Run services
gcloud run services list --platform managed --region $GCP_REGION

# Get service URLs
gcloud run services describe salesprep-api \
  --platform managed \
  --region $GCP_REGION \
  --format 'value(status.url)'

gcloud run services describe salesprep-web \
  --platform managed \
  --region $GCP_REGION \
  --format 'value(status.url)'
```

### Health Checks

Test health endpoints:

```bash
# API health check
curl https://salesprep-api-xxx.run.app/api/health

# Web health check
curl https://salesprep-web-xxx.run.app/
```

### Database (Firestore)

The application uses Firebase Firestore (NoSQL) - no migrations needed. Data is stored in collections: users, meetings, briefings, settings.

### Monitoring

Set up monitoring in GCP Console:

1. Go to Cloud Run → Select service
2. View metrics: Request count, latency, errors
3. Set up alerts for error rates and latency

### Custom Domain (Optional)

Map custom domains to Cloud Run services:

```bash
# Map domain to API
gcloud run domain-mappings create \
  --service salesprep-api \
  --domain api.yourdomain.com \
  --region $GCP_REGION

# Map domain to Web
gcloud run domain-mappings create \
  --service salesprep-web \
  --domain app.yourdomain.com \
  --region $GCP_REGION
```

Then add DNS records as instructed by the output.

## Troubleshooting

### Authentication Issues

If WIF authentication fails:

```bash
# Verify WIF pool and provider exist
gcloud iam workload-identity-pools list --location=global

# Check service account IAM bindings
gcloud iam service-accounts get-iam-policy $SERVICE_ACCOUNT_EMAIL
```

### Build Failures

Check GitHub Actions logs:
- Ensure all secrets are set correctly
- Verify Dockerfile paths match repository structure
- Check that `package.json` has required scripts

### Deployment Failures

```bash
# Check Cloud Run service logs
gcloud run services logs read salesprep-api --region $GCP_REGION --limit 50

# Describe service for detailed status
gcloud run services describe salesprep-api --region $GCP_REGION
```

### Image Push Failures

```bash
# Verify Artifact Registry permissions
gcloud artifacts repositories get-iam-policy salesprep --location=$GCP_REGION

# Test authentication
gcloud auth configure-docker $GCP_REGION-docker.pkg.dev
```

### Service Not Accessible

- Check that `--allow-unauthenticated` is set (for public access)
- Verify firewall rules don't block Cloud Run
- Check service account has necessary permissions

### Firestore Connection Issues

- Ensure Firebase service account credentials are set correctly
- Check that Firestore database is created in the Firebase project
- Verify Firestore security rules allow server access

## Cost Optimization

- **Min instances**: Set to 0 for staging to avoid idle charges
- **Max instances**: Limit based on expected traffic
- **CPU allocation**: Use "CPU is only allocated during request processing"
- **Memory**: Start with minimum required and scale up if needed

## Security Best Practices

1. **Never commit secrets** to repository
2. **Use separate databases** for staging and production
3. **Enable VPC connectors** for private resources
4. **Use Secret Manager** for sensitive environment variables (optional upgrade)
5. **Regularly rotate** service account keys and secrets
6. **Monitor IAM permissions** and apply principle of least privilege
7. **Enable Binary Authorization** for additional security (optional)

## Additional Resources

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation)
- [Artifact Registry](https://cloud.google.com/artifact-registry/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

For issues or questions, contact the DevOps team or refer to the project's AGENTS.md file.

