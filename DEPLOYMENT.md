# Deploying Lustre Homeware to Azure

This guide provisions three Azure resources — Azure SQL Database, an App Service
for the API, and a Static Web App for the frontend — and deploys the code to them.

Prerequisites: an Azure subscription, the [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli)
installed and run `az login`, and Node.js 18+ installed locally.

## 1. Create a resource group

```bash
az group create --name lustre-homeware-rg --location eastus
```

## 2. Provision infrastructure with Bicep

The template in `infra/main.bicep` creates:
- An Azure SQL **serverless** server + database (auto-pauses when idle, to control cost)
- A Linux App Service plan (Basic B1) + Web App for the Node API
- A Static Web App (Free tier) for the React frontend

```bash
az deployment group create \
  --resource-group lustre-homeware-rg \
  --template-file infra/main.bicep \
  --parameters sqlAdminPassword='<choose-a-strong-password>'
```

Note the outputs — `sqlServerFqdn`, `apiUrl`, `staticWebAppDefaultHostname` — you'll
need them below.

## 3. Allow your IP to reach Azure SQL (for the schema load)

```bash
MY_IP=$(curl -s ifconfig.me)
az sql server firewall-rule create \
  --resource-group lustre-homeware-rg \
  --server <sqlServerName-from-output> \
  --name AllowMyIP \
  --start-ip-address $MY_IP --end-ip-address $MY_IP
```

## 4. Load the schema and seed data

Using `sqlcmd` (or Azure Data Studio / SSMS if you prefer a GUI):

```bash
sqlcmd -S <sqlServerFqdn> -d lustre-catalog-db -U lustre_admin -P '<your-password>' -i database/schema.sql
sqlcmd -S <sqlServerFqdn> -d lustre-catalog-db -U lustre_admin -P '<your-password>' -i database/seed.sql
```

## 5. Deploy the backend API to App Service

The Bicep template already wired the App Service's environment variables
(`DB_SERVER`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`) to reach the database.

```bash
cd backend
npm install --omit=dev
zip -r ../api.zip . -x ".env*"
cd ..
az webapp deploy \
  --resource-group lustre-homeware-rg \
  --name lustre-homeware-api \
  --src-path api.zip \
  --type zip
```

Confirm it's up: `curl https://lustre-homeware-api.azurewebsites.net/api/health`

## 6. Deploy the frontend to Static Web Apps

First point the frontend at the live API by setting `frontend/.env.production`:

```
VITE_API_BASE=https://lustre-homeware-api.azurewebsites.net/api
```

(and update `frontend/src/api.js`'s `BASE` constant to read
`import.meta.env.VITE_API_BASE || '/api'` if you haven't already wired that in.)

Then build and deploy:

```bash
cd frontend
npm install
npm run build
npx @azure/static-web-apps-cli deploy ./dist \
  --deployment-token <get-from-portal-or-az-staticwebapp-secrets-list>
```

To get the deployment token instead via CLI:

```bash
az staticwebapp secrets list \
  --name lustre-homeware-web \
  --query "properties.apiKey" -o tsv
```

## 7. (Recommended) Wire up CI/CD

For ongoing changes, connect the Static Web App to your GitHub repo
(`az staticwebapp create --source <repo-url> ...` or via the Portal's
"Deployment" blade) to get an automatic GitHub Actions workflow for the
frontend, and add a second Actions workflow using `azure/webapps-deploy@v3`
for the backend on every push to `main`.

## Cost notes

- Azure SQL **serverless (GP_S_Gen5_1)** auto-pauses after an hour idle by
  default here (60 min) — good for a low-traffic catalog, cold start adds
  a few seconds to the first query after a pause.
- App Service **B1** is the cheapest tier that supports always-on custom
  domains/SSL; drop to a Consumption-based Azure Functions API instead if
  you want a lower floor.
- Static Web Apps **Free** tier covers small catalog sites; upgrade to
  Standard for custom auth rules or higher bandwidth.
