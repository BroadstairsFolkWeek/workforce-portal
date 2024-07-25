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

      B2C_CLIENT_ID: b2cClientId
      B2C_CLIENT_SECRET: b2cClientSecret
      B2C_TENANT_ID: b2cTenantId
      AZURE_B2C_CLIENT_ID: b2cClientId
      AZURE_B2C_CLIENT_SECRET: b2cClientSecret
      AZURE_B2C_TENANT_ID: b2cTenantId

      AZURE_TENANT_ID: graphTenantId
      AZURE_CLIENT_ID: graphClientId
      AZURE_CLIENT_SECRET: graphClientSecret

      WORKFORCE_SITE: wfSharePointSite
      WORKFORCE_SITE_HOSTNAME: wfSharePointSiteHostname
      WORKFORCE_SITE_PATH: wfSharePointSitePath
      WORKFORCE_CLIENT_ID: wfSpClientId
      WORKFORCE_CLIENT_SECRET: wfSpClientSecret

      WORKFORCE_LOGINS_LIST_GUID: wfLoginsListGuid
      WORKFORCE_PROFILES_LIST_GUID: wfProfilesListGuid
      WORKFORCE_APPLICATIONS_LIST_GUID: wfApplicationsListGuid
      WORKFORCE_TEAMS_LIST_GUID: wfTeamsListGuid
      WORKFORCE_PHOTOS_LIST_GUID: wfPhotosListGuid
      WORKFORCE_PHOTOS_SERVER_RELATIVE_URL: wfPhotosServerRelativeUrl
      WORKFORCE_PHOTOS_LIBRARY_TITLE: wfPhotosLibraryTitle
      MAX_PROFILE_PHOTOS_PER_PERSON: wfMaxProfilePhotosPerPerson

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
