@description('Name of the environment these provisioned resources relate to. Will be incoporated into resource names.')
@allowed(['dev', 'prod'])
param environmentName string

@description('Element to form part of resource names to ensure uniqueness in Azure.')
@minLength(5)
@maxLength(10)
param resourceUniqueNameElement string

@description('Client ID of the application registration in Azure AD B2C')
param b2cClientId string
@description('Client secret of the application registration in Azure AD B2C')
@secure()
param b2cClientSecret string
@description('Tenant ID of the Azure AD B2C instance')
param b2cTenantId string

@description('Client ID of the application registration for accessing Microsoft Graph API')
param graphClientId string
@description('Client secret of the application registration for accessing Microsoft Graph API')
@secure()
param graphClientSecret string
@description('Tenant ID of the Azure AD instance that the application registration for accessing Microsoft Graph API belongs to')
param graphTenantId string

@description('SharePoint site URL for the workforce site')
param wfSharePointSite string
@description('Hostname of the SharePoint site for the workforce site')
param wfSharePointSiteHostname string
@description('Path of the SharePoint site for the workforce site')
param wfSharePointSitePath string

@description('Client ID of the application registration in SharePoint for the workforce site')
param wfSpClientId string
@description('Client secret of the application registration in SharePoint for the workforce site')
@secure()
param wfSpClientSecret string

param wfLoginsListGuid string
param wfProfilesListGuid string
param wfApplicationsListGuid string
param wfTeamsListGuid string
param wfPhotosListGuid string
param wfPhotosServerRelativeUrl string
param wfPhotosLibraryTitle string
param wfMaxProfilePhotosPerPerson string

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
    tags: tags

    b2cClientId: b2cClientId
    b2cClientSecret: b2cClientSecret
    b2cTenantId: b2cTenantId
    graphClientId: graphClientId
    graphClientSecret: graphClientSecret
    graphTenantId: graphTenantId
    wfSharePointSite: wfSharePointSite
    wfSharePointSiteHostname: wfSharePointSiteHostname
    wfSharePointSitePath: wfSharePointSitePath
    wfSpClientId: wfSpClientId
    wfSpClientSecret: wfSpClientSecret
    wfLoginsListGuid: wfLoginsListGuid
    wfProfilesListGuid: wfProfilesListGuid
    wfApplicationsListGuid: wfApplicationsListGuid
    wfTeamsListGuid: wfTeamsListGuid
    wfPhotosListGuid: wfPhotosListGuid
    wfPhotosServerRelativeUrl: wfPhotosServerRelativeUrl
    wfPhotosLibraryTitle: wfPhotosLibraryTitle
    wfMaxProfilePhotosPerPerson: wfMaxProfilePhotosPerPerson
    signUpSignInAuthority: signUpSignInAuthority
    wfApiUrl: wfApiUrl
    wfApiClientAuthAuthority: wfApiClientAuthAuthority
    wfApiClientAuthClientId: wfApiClientAuthClientId
    wfApiClientAuthClientSecret: wfApiClientAuthClientSecret
    wfApiClientAuthScope: wfApiClientAuthScope
  }
}
