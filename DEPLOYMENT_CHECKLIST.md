# Deployment Checklist

Quick checklist for setting up and deploying to GCP Cloud Run.

## Initial GCP Setup

### Prerequisites
- [ ] GCP Project created with billing enabled
- [ ] Owner or Editor role in GCP project
- [ ] `gcloud` CLI installed and authenticated
- [ ] GitHub repository created

### GCP Configuration

#### 1. Enable APIs
```bash
export GCP_PROJECT_ID="your-project-id"
export GCP_REGION="us-central1"

gcloud services enable \
  run.googleapis.com \
  iamcredentials.googleapis.com \
  artifactregistry.googleapis.com \
  sts.googleapis.com
```

- [ ] Cloud Run API enabled
- [ ] IAM Credentials API enabled
- [ ] Artifact Registry API enabled
- [ ] Security Token Service API enabled

#### 2. Create Artifact Registry
```bash
gcloud artifacts repositories create salesprep \
  --repository-format=docker \
  --location=$GCP_REGION
```

- [ ] Artifact Registry repository `salesprep` created

#### 3. Set Up Workload Identity Federation
```bash
export GITHUB_ORG="your-github-org"
export GITHUB_REPO="your-repo-name"

# Create pool
gcloud iam workload-identity-pools create "github-pool" \
  --project="$GCP_PROJECT_ID" \
  --location="global" \
  --display-name="GitHub Actions Pool"

# Create provider
gcloud iam workload-identity-pools providers create-oidc "github-provider" \
  --project="$GCP_PROJECT_ID" \
  --location="global" \
  --workload-identity-pool="github-pool" \
  --display-name="GitHub Provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" \
  --attribute-condition="assertion.repository_owner == '$GITHUB_ORG'" \
  --issuer-uri="https://token.actions.githubusercontent.com"

# Get provider name (save for GitHub secrets)
gcloud iam workload-identity-pools providers describe "github-provider" \
  --project="$GCP_PROJECT_ID" \
  --location="global" \
  --workload-identity-pool="github-pool" \
  --format="value(name)"
```

- [ ] Workload Identity Pool `github-pool` created
- [ ] Workload Identity Provider `github-provider` created
- [ ] Provider resource name saved

#### 4. Create Service Account
```bash
gcloud iam service-accounts create github-actions-deployer \
  --project="$GCP_PROJECT_ID" \
  --display-name="GitHub Actions Deployer"

export SERVICE_ACCOUNT_EMAIL="github-actions-deployer@$GCP_PROJECT_ID.iam.gserviceaccount.com"
```

- [ ] Service account `github-actions-deployer` created
- [ ] Service account email saved

#### 5. Grant IAM Permissions
```bash
# Grant roles to service account
gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
  --role="roles/artifactregistry.admin"

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
  --role="roles/iam.serviceAccountTokenCreator"

gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
  --role="roles/iam.serviceAccountUser"

# Get WIF pool ID
export WORKLOAD_IDENTITY_POOL_ID=$(gcloud iam workload-identity-pools describe "github-pool" \
  --project="$GCP_PROJECT_ID" \
  --location="global" \
  --format="value(name)")

# Allow GitHub to impersonate service account
gcloud iam service-accounts add-iam-policy-binding $SERVICE_ACCOUNT_EMAIL \
  --project="$GCP_PROJECT_ID" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/${WORKLOAD_IDENTITY_POOL_ID}/attribute.repository/${GITHUB_ORG}/${GITHUB_REPO}"
```

- [ ] Service account has `roles/run.admin`
- [ ] Service account has `roles/artifactregistry.admin`
- [ ] Service account has `roles/iam.serviceAccountTokenCreator`
- [ ] Service account has `roles/iam.serviceAccountUser`
- [ ] GitHub repository can impersonate service account

#### 6. Verify Setup (Optional)
```bash
chmod +x .github/scripts/verify-gcp-setup.sh
./.github/scripts/verify-gcp-setup.sh
```

- [ ] GCP setup verification script passes

## GitHub Configuration

### Set Repository Secrets

#### Core Secrets
```bash
gh secret set GCP_PROJECT_ID -b "$GCP_PROJECT_ID"
gh secret set GCP_REGION -b "$GCP_REGION"
gh secret set GCP_WIF_PROVIDER -b "<provider-resource-name>"
gh secret set GCP_WIF_SERVICE_ACCOUNT -b "$SERVICE_ACCOUNT_EMAIL"
```

- [ ] `GCP_PROJECT_ID` set
- [ ] `GCP_REGION` set
- [ ] `GCP_WIF_PROVIDER` set
- [ ] `GCP_WIF_SERVICE_ACCOUNT` set

#### API Secrets
- [ ] `REDIS_URL` - Redis connection string
- [ ] `FIREBASE_PROJECT_ID` - Firebase project ID
- [ ] `FIREBASE_PRIVATE_KEY` - Firebase service account private key
- [ ] `FIREBASE_CLIENT_EMAIL` - Firebase service account email
- [ ] `CORS_ORIGINS` - Comma-separated allowed origins
- [ ] `GOOGLE_CLIENT_ID` - Google OAuth client ID
- [ ] `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- [ ] `OPENAI_API_KEY` - OpenAI API key

#### Web Secrets
- [ ] `VITE_API_URL` - Backend API URL (get after API deployment)
- [ ] `VITE_FIREBASE_API_KEY` - Firebase web API key
- [ ] `VITE_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- [ ] `VITE_FIREBASE_PROJECT_ID` - Firebase project ID
- [ ] `VITE_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- [ ] `VITE_FIREBASE_APP_ID` - Firebase app ID
- [ ] `VITE_FIREBASE_MEASUREMENT_ID` - Firebase measurement ID (optional)

### Create Environments

1. Go to repository Settings → Environments
2. Create two environments:

- [ ] `staging` environment created
- [ ] `production` environment created
- [ ] Production environment has protection rules (required reviewers, branch restrictions)

## First Deployment

### Deploy API First
- [ ] Trigger API deployment (push to `main` or manual workflow)
- [ ] Verify API is running in Cloud Run console
- [ ] Get API service URL from Cloud Run
- [ ] Test API health endpoint: `curl https://API_URL/api/health`

### Update Web Configuration
- [ ] Update `VITE_API_URL` GitHub secret with API URL

### Deploy Web
- [ ] Trigger Web deployment (push to `main` or manual workflow)
- [ ] Verify Web is running in Cloud Run console
- [ ] Get Web service URL from Cloud Run
- [ ] Test Web in browser

## Post-Deployment

### Verify Services
- [ ] API health check passes
- [ ] Web application loads correctly
- [ ] Web can communicate with API
- [ ] Authentication works (Firebase)
- [ ] Firestore connection working
- [ ] Google Calendar integration working

### Set Up Monitoring (Optional)
- [ ] Configure Cloud Run alerts for error rates
- [ ] Configure Cloud Run alerts for latency
- [ ] Set up uptime monitoring
- [ ] Configure log-based metrics

### Custom Domains (Optional)
- [ ] Map custom domain to API service
- [ ] Map custom domain to Web service
- [ ] Update DNS records
- [ ] Update `CORS_ORIGINS` with custom domains
- [ ] Update `VITE_API_URL` with custom API domain

## Ongoing Operations

### For Each Deployment
- [ ] Code changes committed and pushed
- [ ] Tests passing locally
- [ ] Linting passes
- [ ] CI/CD pipeline runs successfully
- [ ] Health checks pass
- [ ] Verify functionality in deployed environment

### Regular Maintenance
- [ ] Review Cloud Run logs for errors
- [ ] Monitor costs and usage
- [ ] Update dependencies regularly
- [ ] Rotate secrets periodically
- [ ] Review and update IAM permissions

## Resources

- Full deployment guide: `DEPLOYMENT.md`
- Quick reference: `.github/README.md`
- Repository guidelines: `AGENTS.md`
- GCP verification script: `.github/scripts/verify-gcp-setup.sh`

---

**Last Updated**: October 2025

