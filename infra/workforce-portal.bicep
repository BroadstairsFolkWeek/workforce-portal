@description('Name of the environment these provisioned resources relate to. Will be incoporated into resource names.')
@allowed(['dev', 'prod'])
param environmentName string

@description('Element to form part of resource names to ensure uniqueness in Azure.')
@maxLength(10)
param resourceUniqueNameElement string

@description('Custom domain name for the Static Web App')
param customDomainName string

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

@description('Common part of the name of the resources to be created')
var resourceBaseName = environmentName == 'prod'
  ? 'workforce-portal'
  : 'workforce-portal-${environmentName}${resourceUniqueNameElement}'

@description('Tags to be applied to all resources in this deployment')
param tags object = {
  application: 'workforce-portal'
  environment: environmentName
}

module monitoring 'modules/azure-monitor.bicep' = {
  name: 'azure-monitor'
  params: {
    resourceBaseName: resourceBaseName
    location: resourceGroup().location
    tags: tags
  }
}

module swa './modules/azure-swa.bicep' = {
  name: 'swa'
  params: {
    resourceBaseName: resourceBaseName
    location: resourceGroup().location
    appInsightsId: monitoring.outputs.appInsightsId
    appInsightsConnectionString: monitoring.outputs.appInsightsConnectionString
    appInsightsInstrumentationKey: monitoring.outputs.appInsightsInstrumentationKey
    customDomainName: customDomainName
    tags: tags

    b2cClientId: b2cClientId
    b2cClientSecret: b2cClientSecret
    b2cTenantId: b2cTenantId
    signUpSignInAuthority: signUpSignInAuthority
    wfApiUrl: wfApiUrl
    wfApiClientAuthAuthority: wfApiClientAuthAuthority
    wfApiClientAuthClientId: wfApiClientAuthClientId
    wfApiClientAuthClientSecret: wfApiClientAuthClientSecret
    wfApiClientAuthScope: wfApiClientAuthScope
  }
}
