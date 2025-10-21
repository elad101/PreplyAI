#!/bin/bash

# GCP Setup Verification Script
# This script helps verify that all GCP resources are properly configured
# for deploying to Cloud Run via GitHub Actions

set -e

echo "🔍 GCP Cloud Run Deployment Setup Verification"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if required environment variables are set
if [ -z "$GCP_PROJECT_ID" ]; then
    echo -e "${YELLOW}⚠️  GCP_PROJECT_ID not set. Please export it:${NC}"
    echo "   export GCP_PROJECT_ID=\"your-project-id\""
    read -p "Enter your GCP Project ID: " GCP_PROJECT_ID
    export GCP_PROJECT_ID
fi

if [ -z "$GCP_REGION" ]; then
    echo -e "${YELLOW}⚠️  GCP_REGION not set. Using default: us-central1${NC}"
    export GCP_REGION="us-central1"
fi

echo -e "${GREEN}✓${NC} Project ID: $GCP_PROJECT_ID"
echo -e "${GREEN}✓${NC} Region: $GCP_REGION"
echo ""

# Set the project
gcloud config set project $GCP_PROJECT_ID 2>/dev/null

# Function to check if API is enabled
check_api() {
    local api=$1
    local name=$2
    
    if gcloud services list --enabled --filter="name:$api" --format="value(name)" | grep -q "$api"; then
        echo -e "${GREEN}✓${NC} $name is enabled"
    else
        echo -e "${RED}✗${NC} $name is NOT enabled"
        echo -e "   Run: gcloud services enable $api"
        return 1
    fi
}

# Check required APIs
echo "Checking required APIs..."
check_api "run.googleapis.com" "Cloud Run API"
check_api "iamcredentials.googleapis.com" "IAM Service Account Credentials API"
check_api "artifactregistry.googleapis.com" "Artifact Registry API"
check_api "sts.googleapis.com" "Security Token Service API"
echo ""

# Check Artifact Registry repository
echo "Checking Artifact Registry..."
if gcloud artifacts repositories describe salesprep --location=$GCP_REGION >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Artifact Registry repository 'salesprep' exists"
else
    echo -e "${RED}✗${NC} Artifact Registry repository 'salesprep' NOT found"
    echo -e "   Run: gcloud artifacts repositories create salesprep --repository-format=docker --location=$GCP_REGION"
fi
echo ""

# Check Workload Identity Pool
echo "Checking Workload Identity Federation..."
if gcloud iam workload-identity-pools describe github-pool --location=global >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Workload Identity Pool 'github-pool' exists"
    
    # Get pool ID
    POOL_ID=$(gcloud iam workload-identity-pools describe github-pool --location=global --format="value(name)")
    echo "   Pool ID: $POOL_ID"
    
    # Check provider
    if gcloud iam workload-identity-pools providers describe github-provider --location=global --workload-identity-pool=github-pool >/dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Workload Identity Provider 'github-provider' exists"
        
        WIF_PROVIDER=$(gcloud iam workload-identity-pools providers describe github-provider \
            --location=global \
            --workload-identity-pool=github-pool \
            --format="value(name)")
        echo "   Provider: $WIF_PROVIDER"
        echo ""
        echo -e "${YELLOW}📋 Add this to GitHub Secrets as GCP_WIF_PROVIDER:${NC}"
        echo "   $WIF_PROVIDER"
    else
        echo -e "${RED}✗${NC} Workload Identity Provider 'github-provider' NOT found"
    fi
else
    echo -e "${RED}✗${NC} Workload Identity Pool 'github-pool' NOT found"
    echo -e "   See DEPLOYMENT.md for setup instructions"
fi
echo ""

# Check Service Account
echo "Checking Service Account..."
SERVICE_ACCOUNT_EMAIL="github-actions-deployer@$GCP_PROJECT_ID.iam.gserviceaccount.com"

if gcloud iam service-accounts describe $SERVICE_ACCOUNT_EMAIL >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Service account exists: $SERVICE_ACCOUNT_EMAIL"
    echo ""
    echo -e "${YELLOW}📋 Add this to GitHub Secrets as GCP_WIF_SERVICE_ACCOUNT:${NC}"
    echo "   $SERVICE_ACCOUNT_EMAIL"
    echo ""
    
    # Check IAM roles
    echo "Checking IAM roles..."
    PROJECT_POLICY=$(gcloud projects get-iam-policy $GCP_PROJECT_ID --flatten="bindings[].members" --format="table(bindings.role)" --filter="bindings.members:serviceAccount:$SERVICE_ACCOUNT_EMAIL")
    
    if echo "$PROJECT_POLICY" | grep -q "roles/run.admin"; then
        echo -e "${GREEN}✓${NC} Has roles/run.admin"
    else
        echo -e "${RED}✗${NC} Missing roles/run.admin"
    fi
    
    if echo "$PROJECT_POLICY" | grep -q "roles/artifactregistry.admin"; then
        echo -e "${GREEN}✓${NC} Has roles/artifactregistry.admin"
    else
        echo -e "${RED}✗${NC} Missing roles/artifactregistry.admin"
    fi
    
    if echo "$PROJECT_POLICY" | grep -q "roles/iam.serviceAccountTokenCreator"; then
        echo -e "${GREEN}✓${NC} Has roles/iam.serviceAccountTokenCreator"
    else
        echo -e "${RED}✗${NC} Missing roles/iam.serviceAccountTokenCreator"
    fi
    
    if echo "$PROJECT_POLICY" | grep -q "roles/iam.serviceAccountUser"; then
        echo -e "${GREEN}✓${NC} Has roles/iam.serviceAccountUser"
    else
        echo -e "${RED}✗${NC} Missing roles/iam.serviceAccountUser"
    fi
else
    echo -e "${RED}✗${NC} Service account NOT found: $SERVICE_ACCOUNT_EMAIL"
    echo -e "   See DEPLOYMENT.md for setup instructions"
fi
echo ""

# Summary
echo "=============================================="
echo "📋 Next Steps:"
echo ""
echo "1. Set GitHub Secrets (see .github/README.md)"
echo "2. Create GitHub Environments: staging, production"
echo "3. Deploy API first, then Web"
echo "4. Update VITE_API_URL secret with API Cloud Run URL"
echo ""
echo "For complete setup instructions, see DEPLOYMENT.md"
echo "=============================================="

