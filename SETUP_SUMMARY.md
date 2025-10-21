# GCP Cloud Run Deployment - Quick Start

This document provides a quick overview of the deployment infrastructure created for SalesPrep.AI.

## 🎯 What's Been Set Up

### Docker Infrastructure

#### API (`apps/api/Dockerfile`)
- **Base Image**: node:20-alpine (multi-stage build)
- **Build Stage**: Compiles TypeScript
- **Runtime Stage**: Optimized production image with non-root user
- **Port**: 8080 (Cloud Run requirement)
- **Features**: Health checks, signal handling with dumb-init
- **Database**: Firebase Firestore (no Prisma)

#### Web (`apps/web/Dockerfile`)
- **Base Image**: node:20-alpine (build), nginx:alpine (runtime)
- **Build Stage**: Vite build process
- **Runtime Stage**: Nginx serving static files
- **Port**: 8080
- **Features**: SPA routing, health checks, gzip compression

### GitHub Actions Workflows

#### `.github/workflows/deploy-api.yml`
Automated deployment for the API service:
- ✅ Workload Identity Federation (no static keys)
- ✅ Multi-environment support (staging/production)
- ✅ Automatic database migrations (production)
- ✅ Health check verification
- ✅ Deployment summary in GitHub UI

#### `.github/workflows/deploy-web.yml`
Automated deployment for the Web service:
- ✅ Workload Identity Federation
- ✅ Multi-environment support
- ✅ Environment variables embedded at build time
- ✅ Health check verification
- ✅ Deployment summary in GitHub UI

### Deployment Triggers

| Trigger | Environment | Service Name |
|---------|------------|--------------|
| Push to `main` | Production | `salesprep-api`, `salesprep-web` |
| Push to `develop` | Staging | `salesprep-api-staging`, `salesprep-web-staging` |
| Tags (`v*`) | Production | `salesprep-api`, `salesprep-web` |
| Manual | User choice | Based on selection |

### Documentation

| File | Purpose |
|------|---------|
| `DEPLOYMENT.md` | Complete GCP setup guide with step-by-step instructions |
| `DEPLOYMENT_CHECKLIST.md` | Interactive checklist for setup and deployment |
| `.github/README.md` | Quick reference for workflows and troubleshooting |
| `.github/scripts/verify-gcp-setup.sh` | Automated verification of GCP configuration |
| `AGENTS.md` | Updated with CI/CD details |

## 🚀 Quick Start Guide

### 1. GCP Setup (One-time)

```bash
# Set variables
export GCP_PROJECT_ID="your-project-id"
export GCP_REGION="us-central1"
export GITHUB_ORG="your-org"
export GITHUB_REPO="your-repo"

# Run setup commands (see DEPLOYMENT.md)
# - Enable APIs
# - Create Artifact Registry
# - Set up Workload Identity Federation
# - Create service account
# - Grant IAM permissions

# Verify setup
./.github/scripts/verify-gcp-setup.sh
```

### 2. GitHub Setup (One-time)

```bash
# Set core secrets
gh secret set GCP_PROJECT_ID -b "$GCP_PROJECT_ID"
gh secret set GCP_REGION -b "$GCP_REGION"
gh secret set GCP_WIF_PROVIDER -b "<from-gcp-output>"
gh secret set GCP_WIF_SERVICE_ACCOUNT -b "<from-gcp-output>"

# Set API secrets (see .github/README.md for full list)
# Set Web secrets
```

Create GitHub Environments:
- `staging`
- `production` (with protection rules)

### 3. First Deployment

```bash
# 1. Deploy API
git push origin main  # or trigger workflow manually

# 2. Get API URL from Cloud Run console

# 3. Update Web secret
gh secret set VITE_API_URL -b "https://salesprep-api-xxx.run.app"

# 4. Deploy Web
git push origin main  # or trigger workflow manually
```

## 📊 Architecture

```
GitHub Repository (apps/api, apps/web, apps/worker)
    ↓
GitHub Actions (via Workload Identity Federation)
    ↓
GCP Artifact Registry (salesprep)
    ├── salesprep-api:latest
    └── salesprep-web:latest
    ↓
Cloud Run Services
    ├── salesprep-api (production)
    ├── salesprep-api-staging
    ├── salesprep-web (production)
    └── salesprep-web-staging
    ↓
External Services
    ├── Firebase Firestore (database)
    ├── Redis (caching)
    ├── OpenAI API (AI features)
    └── Google Calendar API
```

## 🔐 Security Features

- ✅ **No Static Keys**: Uses Workload Identity Federation
- ✅ **Least Privilege**: Service account with minimal required permissions
- ✅ **Secrets Management**: All sensitive data in GitHub Secrets
- ✅ **Environment Isolation**: Separate staging and production services
- ✅ **Non-root Containers**: All containers run as non-root users
- ✅ **HTTPS Only**: All Cloud Run services use HTTPS
- ✅ **Protected Deployments**: Production environment has approval requirements

## 🛠️ Resources Required

### GCP Resources
- Cloud Run (2 services per environment)
- Artifact Registry (1 repository)
- Workload Identity Pool (1)
- Service Account (1)

### GitHub Resources
- GitHub Actions minutes (varies by plan)
- Secrets (4 core + environment-specific)
- Environments (2: staging, production)

## 💰 Estimated Costs

**Cloud Run** (Staging & Production):
- Free tier: 2M requests/month, 360K GB-seconds/month
- Beyond free tier: ~$0.40 per million requests
- Staging with min-instances=0: Pay only when used

**Artifact Registry**:
- First 0.5 GB free
- $0.10/GB/month after

**Typical monthly cost**: $0-50 (depending on traffic)

## 📚 Next Steps

1. **Complete GCP Setup**: Follow `DEPLOYMENT.md`
2. **Set GitHub Secrets**: See `.github/README.md`
3. **Run First Deployment**: Deploy API, then Web
4. **Set Up Monitoring**: Configure Cloud Run alerts
5. **Custom Domains** (optional): Map domains to services

## 🔍 Verification

After setup, verify everything works:

```bash
# GCP setup
./.github/scripts/verify-gcp-setup.sh

# API health
curl https://your-api-url.run.app/api/health

# Web accessibility
curl https://your-web-url.run.app/
```

## 📖 Documentation Reference

| Question | Document |
|----------|----------|
| How do I set up GCP? | `DEPLOYMENT.md` |
| What secrets do I need? | `.github/README.md` |
| How do I deploy manually? | `.github/README.md` |
| What if something fails? | `DEPLOYMENT.md` → Troubleshooting |
| How do I verify my setup? | `.github/scripts/verify-gcp-setup.sh` |
| What's the complete checklist? | `DEPLOYMENT_CHECKLIST.md` |

## 🤝 Support

For issues or questions:
1. Check documentation (links above)
2. Review GitHub Actions logs (Actions tab)
3. Check Cloud Run logs (GCP Console)
4. See troubleshooting section in `DEPLOYMENT.md`

---

**Created**: October 2025  
**For**: SalesPrep.AI - PreplyAI Repository

