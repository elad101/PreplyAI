# GitHub Actions Workflows

This directory contains CI/CD workflows for deploying to GCP Cloud Run.

## Workflows

### deploy-api.yml
Deploys the API application (`apps/api`) to Cloud Run.

- **Triggers**: Push to `main`/`develop`, tags, manual
- **Service**: `salesprep-api` (production) or `salesprep-api-staging`
- **Docker**: Multi-stage build with node:20-alpine
- **Port**: 8080
- **Database**: Firebase Firestore (no migrations needed)

### deploy-web.yml
Deploys the Web application (`apps/web`) to Cloud Run.

- **Triggers**: Push to `main`/`develop`, tags, manual
- **Service**: `salesprep-web` (production) or `salesprep-web-staging`
- **Docker**: Vite build + nginx static file serving
- **Port**: 8080

## Quick Setup

### 1. Set Required Secrets

```bash
# Core GCP secrets
gh secret set GCP_PROJECT_ID -b "your-project-id"
gh secret set GCP_REGION -b "us-central1"
gh secret set GCP_WIF_PROVIDER -b "projects/.../providers/github-provider"
gh secret set GCP_WIF_SERVICE_ACCOUNT -b "github-actions-deployer@project.iam.gserviceaccount.com"

# API secrets
gh secret set REDIS_URL -b "redis://..."
gh secret set FIREBASE_PROJECT_ID -b "your-firebase-project"
gh secret set FIREBASE_PRIVATE_KEY -b "-----BEGIN PRIVATE KEY-----\n..."
gh secret set FIREBASE_CLIENT_EMAIL -b "firebase-adminsdk@project.iam.gserviceaccount.com"
gh secret set CORS_ORIGINS -b "https://app.example.com,https://app-staging.example.com"
gh secret set GOOGLE_CLIENT_ID -b "your-google-client-id"
gh secret set GOOGLE_CLIENT_SECRET -b "your-google-client-secret"
gh secret set OPENAI_API_KEY -b "sk-..."

# Web secrets
gh secret set VITE_API_URL -b "https://salesprep-api-xxx.run.app"
gh secret set VITE_FIREBASE_API_KEY -b "your-firebase-api-key"
gh secret set VITE_FIREBASE_AUTH_DOMAIN -b "your-project.firebaseapp.com"
gh secret set VITE_FIREBASE_PROJECT_ID -b "your-firebase-project"
gh secret set VITE_FIREBASE_STORAGE_BUCKET -b "your-project.appspot.com"
gh secret set VITE_FIREBASE_MESSAGING_SENDER_ID -b "123456789"
gh secret set VITE_FIREBASE_APP_ID -b "1:123:web:abc"
gh secret set VITE_FIREBASE_MEASUREMENT_ID -b "G-XXXXXXXXXX"
```

### 2. Create Environments

Create `staging` and `production` environments in GitHub:
- Settings → Environments → New environment

For production, add protection rules:
- Required reviewers
- Deployment branches: `main` only

### 3. Complete GCP Setup

See `DEPLOYMENT.md` for full GCP setup instructions including:
- Enabling APIs
- Creating Artifact Registry
- Setting up Workload Identity Federation
- Configuring IAM permissions

## Manual Deployment

1. Go to Actions tab
2. Select workflow (API or Web)
3. Click "Run workflow"
4. Choose branch and environment
5. Run

## Monitoring Deployments

- **View logs**: Actions tab → Select workflow run
- **Service status**: GCP Console → Cloud Run
- **Logs**: Cloud Run → Service → Logs tab

## Troubleshooting

### Authentication Failed
- Verify WIF provider and service account are correct
- Check service account has required IAM roles
- Ensure repository is allowed in WIF attribute condition

### Build Failed
- Check Dockerfile paths match repository structure
- Verify all required files exist (`package.json`, etc.)
- Review build logs in Actions tab

### Deployment Failed
- Check service account has `roles/run.admin`
- Verify all required secrets are set
- Review Cloud Run service logs

### Health Check Failed
- Ensure service is listening on port 8080
- Check health endpoint responds correctly
- Verify environment variables are set correctly

## Additional Resources

- Full deployment guide: `../DEPLOYMENT.md`
- Repository guidelines: `../AGENTS.md`
- GCP Cloud Run docs: https://cloud.google.com/run/docs

