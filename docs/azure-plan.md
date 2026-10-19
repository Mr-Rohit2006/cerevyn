# Azure Hosting Plan: PS09 Adaptive Memory Matching Game

## 1. Executive Summary

This document specifies the deployment architecture, configuration, security practices, and operational procedures for hosting the **PS09 Adaptive Memory Matching Game** on **Microsoft Azure**.

The application is a modern Single Page Application (SPA) built with React, TypeScript, and Vite. The recommended hosting solution is **Azure Static Web Apps (Standard or Free tier)**, which provides globally distributed content delivery (CDN), automated GitHub Actions CI/CD integration, free managed SSL certificates, and zero-maintenance static asset serving.

---

## 2. Target Architecture

```
                                  +------------------------------------+
                                  |         GitHub Repository          |
                                  |     (main branch / PR branches)    |
                                  +-----------------+------------------+
                                                    |
                                                    | Push / PR triggers
                                                    v
                                  +-----------------+------------------+
                                  |      GitHub Actions Workflow       |
                                  |  - Run Vitest suite (36 tests)     |
                                  |  - Run `npm run build` (Vite)      |
                                  |  - Deploy `dist/` directory        |
                                  +-----------------+------------------+
                                                    |
                                                    | Secure API Token
                                                    v
+-----------------------+         +-----------------+------------------+
|      End User         | <-----> |     Azure Static Web Apps (SWA)    |
| (Browser / Interview) |  HTTPS  |  - Global Microsoft CDN Edge       |
+-----------------------+         |  - Custom Domain & Free SSL        |
                                  |  - Client-side navigation fallback |
                                  |  - Security response headers       |
                                  +------------------------------------+
```

### Key Architectural Attributes:
1. **High Availability & CDN Edge**: Static bundles (`HTML`, `CSS`, `JS`, SVGs) are cached globally across Azure's edge points of presence.
2. **Cost-Effective**: Operates efficiently on Azure Static Web Apps Free tier ($0/month) with generous bandwidth (100 GB/month) and zero server compute overhead.
3. **Deterministic Deployments**: Only code passing all 36 automated unit and integration tests is built and published.
4. **Zero Server Vulnerabilities**: Client-side SPA runs entirely inside the user's browser; state is persisted locally via Web Storage (`localStorage`).

---

## 3. Azure Setup: Step-by-Step

### Option A: Azure Portal Setup
1. Log in to [Azure Portal](https://portal.azure.com/).
2. Click **Create a Resource** > Search for **Static Web App** > Click **Create**.
3. Configure Resource Details:
   - **Subscription**: Select active Azure subscription.
   - **Resource Group**: `rg-cerevyn-assessment` (create new).
   - **Name**: `ps09-adaptive-memory-game`.
   - **Plan type**: `Free` (sufficient for production SPA).
   - **Region**: Choose closest geographic region (e.g., `East US 2` or `Central India`).
4. Deployment Details:
   - **Source**: `GitHub`.
   - Authorize Azure to access your GitHub account and select your repository and branch (`main`).
   - **Build Presets**: `Custom`.
   - **App location**: `/`
   - **Api location**: Leave empty (no backend functions required).
   - **Output location**: `dist`
5. Click **Review + Create**, then **Create**.
6. Azure automatically creates a deployment workflow file in `.github/workflows/azure-static-web-apps-<random-name>.yml` and stores the deployment secret `AZURE_STATIC_WEB_APPS_API_TOKEN_<ID>` in your GitHub repository secrets.

### Option B: Azure CLI Deployment
You can also automate the creation using the Azure CLI:

```bash
# 1. Login to Azure
az login

# 2. Create Resource Group
az group create \
  --name rg-cerevyn-assessment \
  --location eastus2

# 3. Create Static Web App with GitHub link
az staticwebapp create \
  --name ps09-adaptive-memory-game \
  --resource-group rg-cerevyn-assessment \
  --source https://github.com/<YOUR_GITHUB_USER>/<REPO_NAME> \
  --location eastus2 \
  --branch main \
  --app-location "/" \
  --output-location "dist" \
  --login-with-github
```

---

## 4. GitHub Actions Deployment Workflow

The production deployment workflow template is provided below:

```yaml
name: Azure Static Web Apps Deploy

on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main

jobs:
  build_and_deploy_job:
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    name: Build and Deploy
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: true

      - name: Setup Node.js 22.x
        uses: actions/setup-node@v4
        with:
          node-version: 22.x
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run Test Suite
        run: npm test

      - name: Build Application
        run: npm run build

      - name: Deploy to Azure Static Web Apps
        id: builddeploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/"
          api_location: ""
          output_location: "dist"

  close_pull_request_job:
    if: github.event_name == 'pull_request' && github.event.action == 'closed'
    runs-on: ubuntu-latest
    name: Close Pull Request Preview
    steps:
      - name: Close Pull Request Environment
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          action: "close"
```

---

## 5. Security & Configuration Best Practices

1. **No Hardcoded Credentials**:
   - Zero secrets or tokens are stored in source control.
   - All deployment tokens are managed through GitHub Repository Secrets (`AZURE_STATIC_WEB_APPS_API_TOKEN`).

2. **Security Headers**:
   - Configured via `public/staticwebapp.config.json`.
   - Sets `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and Content Security Policy (CSP).

3. **Client-Side Routing / Navigation Fallback**:
   - Any unknown path rewrites cleanly to `/index.html` with HTTP 200 to prevent 404 errors during client navigation.

4. **Environment Isolation**:
   - Pull Requests generate temporary staging environments (Azure SWA Staging Previews) with distinct URLs, allowing pull request reviewers to verify features live before merging into `main`.

---

## 6. Verification and Rollback Strategy

1. **Post-Deployment Verification**:
   - Visit deployed URL (e.g. `https://<app-name>.azurestaticapps.net`).
   - Run audit via Google Lighthouse (performance, accessibility, best practices).
   - Verify card flip animations, deterministic seed functionality, and local session persistence.

2. **Rollback Strategy**:
   - In case of an unexpected regression, git revert the problematic commit on `main`:
     ```bash
     git revert HEAD
     git push origin main
     ```
   - Azure SWA also supports rolling back to previous deployments directly in the Azure Portal Deployment History panel.
