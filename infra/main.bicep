// Lustre Homeware - core Azure infrastructure
// Deploy with: az deployment group create -g <resource-group> -f main.bicep --parameters sqlAdminPassword=<secret>

@description('Short name used to prefix resources')
param appName string = 'lustre-homeware'

@description('Azure region for all resources')
param location string = resourceGroup().location

@description('Administrator login for the Azure SQL server')
param sqlAdminLogin string = 'lustre_admin'

@secure()
@description('Administrator password for the Azure SQL server')
param sqlAdminPassword string

var sqlServerName = '${appName}-sql-${uniqueString(resourceGroup().id)}'
var sqlDbName = 'lustre-catalog-db'
var appServicePlanName = '${appName}-plan'
var apiAppName = '${appName}-api'
var staticWebAppName = '${appName}-web'

resource sqlServer 'Microsoft.Sql/servers@2023-05-01-preview' = {
  name: sqlServerName
  location: location
  properties: {
    administratorLogin: sqlAdminLogin
    administratorLoginPassword: sqlAdminPassword
    version: '12.0'
  }
}

resource sqlFirewallAllowAzure 'Microsoft.Sql/servers/firewallRules@2023-05-01-preview' = {
  parent: sqlServer
  name: 'AllowAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

resource sqlDb 'Microsoft.Sql/servers/databases@2023-05-01-preview' = {
  parent: sqlServer
  name: sqlDbName
  location: location
  sku: {
    name: 'GP_S_Gen5_1' // General Purpose Serverless, 1 vCore - cost efficient for a catalog site
    tier: 'GeneralPurpose'
  }
  properties: {
    autoPauseDelay: 60
    minCapacity: json('0.5')
  }
}

resource appServicePlan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: appServicePlanName
  location: location
  sku: {
    name: 'B1'
    tier: 'Basic'
  }
  kind: 'linux'
  properties: {
    reserved: true
  }
}

resource apiApp 'Microsoft.Web/sites@2023-01-01' = {
  name: apiAppName
  location: location
  kind: 'app,linux'
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: 'NODE|20-lts'
      appSettings: [
        { name: 'DB_SERVER', value: '${sqlServerName}.database.windows.net' }
        { name: 'DB_NAME', value: sqlDbName }
        { name: 'DB_USER', value: sqlAdminLogin }
        { name: 'DB_PASSWORD', value: sqlAdminPassword }
        { name: 'DB_PORT', value: '1433' }
        { name: 'WEBSITES_PORT', value: '8080' }
      ]
    }
    httpsOnly: true
  }
}

resource staticWebApp 'Microsoft.Web/staticSites@2023-01-01' = {
  name: staticWebAppName
  location: location
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {}
}

output sqlServerFqdn string = '${sqlServerName}.database.windows.net'
output apiUrl string = 'https://${apiApp.properties.defaultHostName}'
output staticWebAppDefaultHostname string = staticWebApp.properties.defaultHostname
