@description('Name of the environment these provisioned resources relate to. Will be incoporated into resource names.')
@allowed(['dev', 'prod'])
param environmentName string

@description('Element to form part of resource names to ensure uniqueness in Azure.')
@minLength(5)
@maxLength(10)
param resourceUniqueNameElement string

@description('Common part of the name of the resources to be created')
var resourceBaseName = environmentName == 'prod' ? 'workforce-portal' : 'workforce-portal-${environmentName}${resourceUniqueNameElement}'

@description('Tags to be applied to all resources in this deployment')
param tags object = {
  application: 'workforce-portal'
  environment: environmentName
}

module swa './modules/azure-swa.bicep' = {
  name: 'swa'
  params: {
    resourceBaseName: resourceBaseName
    location: resourceGroup().location
    tags: tags
  }
}
