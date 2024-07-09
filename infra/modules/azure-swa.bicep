param resourceBaseName string
param location string
param tags object

@description('Resource ID of the Application Insights instance that SWA will use')
param appInsightsId string
@description('Connection string for Application Insights')
param appInsightsConnectionString string
@description('Instrumentation key for Application Insights')
param appInsightsInstrumentationKey string

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
    name: 'Free'
    size: 'Free'
  }

  resource staticSiteSettings 'config' = {
    name: 'appsettings'
    properties: {
      APPINSIGHTS_INSTRUMENTATIONKEY: appInsightsInstrumentationKey
      APPLICATIONINSIGHTS_CONNECTION_STRING: appInsightsConnectionString
    }
  }
}
