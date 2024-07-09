param resourceBaseName string
param location string
param tags object

param repositoryUrl string
param repositoryToken string

resource staticSite 'Microsoft.Web/staticSites@2022-09-01' = {
  name: resourceBaseName
  location: location
  tags: tags
  properties: {
    branch: 'main'
    repositoryUrl: repositoryUrl
    repositoryToken: repositoryToken
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
