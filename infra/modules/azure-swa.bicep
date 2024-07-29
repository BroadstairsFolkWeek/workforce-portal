param resourceBaseName string
param location string
param tags object

@description('Custom domain name for the Static Web App')
param customDomainName string

@description('Resource ID of the Application Insights instance that SWA will use')
param appInsightsId string
@description('Connection string for Application Insights')
param appInsightsConnectionString string
@description('Instrumentation key for Application Insights')
param appInsightsInstrumentationKey string

@description('Client ID of the application registration in Azure AD B2C')
param b2cClientId string
@description('Client secret of the application registration in Azure AD B2C')
@secure()
param b2cClientSecret string
@description('Tenant ID of the Azure AD B2C instance')
param b2cTenantId string

param signUpSignInAuthority string

param wfApiUrl string
param wfApiClientAuthAuthority string
param wfApiClientAuthClientId string
@secure()
param wfApiClientAuthClientSecret string
param wfApiClientAuthScope string

var tagsWithHiddenLinks = union(
  {
    'hidden-link: /app-insights-resource-id': appInsightsId
    'hidden-link: /app-insights-instrumentation-key': appInsightsInstrumentationKey
    'hidden-link: /app-insights-conn-string': appInsightsConnectionString
  },
  tags
)

resource staticSite 'Microsoft.Web/staticSites@2022-09-01' = {
  name: resourceBaseName
  location: location
  tags: tagsWithHiddenLinks
  properties: {
    stagingEnvironmentPolicy: 'Disabled'
    buildProperties: {
      apiBuildCommand: 'npm run buildAndTest'
    }
  }
  sku: {
    name: 'Standard'
    size: 'Standard'
  }

  resource staticSiteSettings 'config' = {
    name: 'appsettings'
    properties: {
      APPINSIGHTS_INSTRUMENTATIONKEY: appInsightsInstrumentationKey
      APPLICATIONINSIGHTS_CONNECTION_STRING: appInsightsConnectionString

      AZURE_B2C_CLIENT_ID: b2cClientId
      AZURE_B2C_CLIENT_SECRET: b2cClientSecret
      AZURE_B2C_TENANT_ID: b2cTenantId

      SIGN_UP_SIGN_IN_AUTHORITY: signUpSignInAuthority

      WF_API_URL: wfApiUrl
      WF_API_CLIENT_AUTH_AUTHORITY: wfApiClientAuthAuthority
      WF_API_CLIENT_AUTH_CLIENT_ID: wfApiClientAuthClientId
      WF_API_CLIENT_AUTH_CLIENT_SECRET: wfApiClientAuthClientSecret
      WF_API_CLIENT_AUTH_SCOPE: wfApiClientAuthScope
    }
  }

  resource customDomain 'customDomains' = {
    name: customDomainName
  }
}
