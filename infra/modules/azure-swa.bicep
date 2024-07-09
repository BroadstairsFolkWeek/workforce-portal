param resourceBaseName string
param location string
param tags object

resource staticSite 'Microsoft.Web/staticSites@2022-09-01' = {
  name: resourceBaseName
  location: location
  tags: tags
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
}
