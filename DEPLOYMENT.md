# Northwestern Campus Laundry Hub - Deployment Guide

This document provides instructions for deploying the Northwestern Campus Laundry Hub application to Azure cloud services.

## Prerequisites

- Azure account with active subscription
- Azure CLI installed and configured locally
- Git repository with your project code
- Basic knowledge of Azure services

## Azure Resources Setup

The deployment uses the following Azure services:

1. **Azure Database for PostgreSQL - Flexible Server** (already set up as "laundry-db")
2. **Azure App Service** for backend Node.js API
3. **Azure Static Web Apps** for React frontend
4. **Azure Resource Group** (already set up as "jasmine_capstoneproject")

## 1. Database Migration

### Export Local Schema and Data

```bash
# Export schema only (no data)
pg_dump -s -U youxinying postgres > schema.sql

# Optional: Export schema with data
pg_dump -U youxinying postgres > full_backup.sql
```

### Import to Azure PostgreSQL

1. Create a new database in your Azure PostgreSQL server:

```bash
# Connect to Azure PostgreSQL
psql -h laundry-db.postgres.database.azure.com -U <your_azure_username> -d postgres

# Create database
CREATE DATABASE laundry_db;
\c laundry_db

# Exit psql
\q
```

2. Import the schema:

```bash
# Using psql to import
psql -h laundry-db.postgres.database.azure.com -U <your_azure_username> -d laundry_db -f schema.sql
```

## 2. Backend Deployment

### Prepare Backend for Production

1. Create production environment variables:

```bash
# In laundry-backend directory
touch .env.production
```

2. Add the following to `.env.production`:

```
DB_HOST=laundry-db.postgres.database.azure.com
DB_PORT=5432
DB_NAME=laundry_db
DB_USER=<your_azure_username>
DB_PASSWORD=<your_azure_password>
DB_SSL=true

JWT_SECRET=<your_production_jwt_secret>

PORT=8080
NODE_ENV=production
```

3. Create an Azure App Service:

```bash
# Login to Azure CLI
az login

# Create App Service Plan
az appservice plan create --name laundry-backend-plan --resource-group jasmine_capstoneproject --sku B1 --is-linux

# Create Web App
az webapp create --name laundry-backend-app --resource-group jasmine_capstoneproject --plan laundry-backend-plan --runtime "NODE|18-lts"

# Configure environment variables
az webapp config appsettings set --name laundry-backend-app --resource-group jasmine_capstoneproject --settings @.env.production
```

4. Deploy backend code:

```bash
# Navigate to backend directory
cd laundry-backend

# Set deployment source
az webapp deployment source config-local-git --name laundry-backend-app --resource-group jasmine_capstoneproject

# Add Azure remote
git remote add azure <url_from_previous_command>

# Deploy code
git push azure main
```

## 3. Frontend Deployment

### Prepare Frontend for Production

1. Create production environment variables:

```bash
# In laundry-frontend directory
touch .env.production
```

2. Add the following to `.env.production`:

```
REACT_APP_API_URL=https://laundry-backend-app.azurewebsites.net
```

3. Build the production frontend:

```bash
# Navigate to frontend directory
cd laundry-frontend

# Install dependencies
npm install

# Build for production
npm run build
```

4. Deploy to Azure Static Web Apps:

```bash
# Install Static Web Apps CLI
npm install -g @azure/static-web-apps-cli

# Login to Azure
az login

# Create Static Web App
az staticwebapp create --name laundry-frontend-app --resource-group jasmine_capstoneproject --source https://github.com/Xinying777/laundry_reservation_system --location "East US" --branch main --app-location /laundry-frontend --output-location build --api-location ""

# Deploy using the CLI
swa deploy ./build --env production
```

## 4. Configure CORS and Networking

1. Enable CORS on the backend:

```bash
# Add CORS policy to allow Static Web App origin
az webapp cors add --name laundry-backend-app --resource-group jasmine_capstoneproject --allowed-origins "https://laundry-frontend-app.azurestaticapps.net"
```

2. Optional: Set up custom domain:

```bash
# Add custom domain to Static Web App
az staticwebapp hostname add --name laundry-frontend-app --resource-group jasmine_capstoneproject --hostname "laundry.northwestern.edu"
```

## 5. Set Up Continuous Deployment (CI/CD)

### GitHub Actions for Backend

1. Create a GitHub Actions workflow file:

```bash
mkdir -p .github/workflows
touch .github/workflows/backend-deploy.yml
```

2. Add the following content:

```yaml
name: Backend CI/CD

on:
  push:
    branches: [ main ]
    paths:
      - 'laundry-backend/**'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Set up Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: |
        cd laundry-backend
        npm install
        
    - name: Deploy to Azure Web App
      uses: azure/webapps-deploy@v2
      with:
        app-name: 'laundry-backend-app'
        publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
        package: ./laundry-backend
```

3. Store your publish profile as a GitHub secret named `AZURE_WEBAPP_PUBLISH_PROFILE`.

### GitHub Actions for Frontend

The Azure Static Web Apps service automatically sets up GitHub Actions for the frontend.

## 6. Post-Deployment Verification

After deploying, verify the application is running correctly:

1. Test the backend API:
   - Health check: `https://laundry-backend-app.azurewebsites.net/health`
   - API info: `https://laundry-backend-app.azurewebsites.net/api`

2. Access the frontend:
   - Visit: `https://laundry-frontend-app.azurestaticapps.net`
   - Try logging in with a test account
   - Test core functionality

## 7. Monitoring and Maintenance

1. Set up Application Insights:

```bash
# Create Application Insights resource
az monitor app-insights component create --app laundry-app-insights --resource-group jasmine_capstoneproject --location eastus

# Get the instrumentation key
az monitor app-insights component show --app laundry-app-insights --resource-group jasmine_capstoneproject --query instrumentationKey -o tsv
```

2. Add the instrumentation key to your backend app settings:

```bash
az webapp config appsettings set --name laundry-backend-app --resource-group jasmine_capstoneproject --settings APPINSIGHTS_INSTRUMENTATIONKEY=<key>
```

## 8. Backup Strategy

1. Set up automatic database backups:

```bash
# Configure backup retention
az postgres flexible-server backup-config update --resource-group jasmine_capstoneproject --name laundry-db --backup-retention 14
```

2. Manual database backup:

```bash
# Export from Azure PostgreSQL
pg_dump -h laundry-db.postgres.database.azure.com -U <your_azure_username> -d laundry_db > backup_$(date +%Y%m%d).sql
```

## Troubleshooting

### Database Connection Issues
- Check firewall settings: Ensure your App Service can connect to the PostgreSQL server
- SSL issues: Make sure SSL is enabled in your production database connection

### Frontend-Backend Communication
- CORS errors: Verify the CORS policy includes your frontend domain
- Network errors: Check if the API URL in frontend production build is correct

### Performance Issues
- Scale up App Service Plan if needed
- Consider adding a caching layer for frequently accessed data

## Support

For deployment issues, please contact the project maintainers or raise an issue in the GitHub repository.
