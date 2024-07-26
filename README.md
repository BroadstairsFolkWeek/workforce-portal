# Broadstairs Folkweek Workforce Portal

Broadstairs Folk Week depends on its volunteer workforce for the running of the festival.

The festival needs potential volunteers to submit an application form to join the workforce, but found that paper and PDF forms were becomeing difficult to manage, both for the applicants and the festival staff.

In 2022 we decided to build the Workforce Portal, a web application that would allow potential volunteers to edit, review and submit their application to join the workforce, without the need to work with paper or PDF forms.

In addition to filling out an application form, portal users are also prompted to fill in basic profile information and provide a photo. The profile information and photo are used by Broadstairs Folk Week to process any submitted forms and carry out any administration activities, such as preparing workforce identity badges.

## Technology

The Workforce Portal is implemented as an Azure Static Web App.

The front-end is a React application, using Redux for statement management, and SurveyJS for redering of forms.

The back-end is an Azure Functions app. In earlier versions of the portal the back-end handled data persistence directly, but as other applications related to workforce administration have been developed, persistance management has been moved to a shared Workforce Services API.

User authentication is handled by an Azure AD B2C instance. Currently this instance only authenticates users with and email address and password.

Ealier versions of the portal also had Azure AD B2C configured to authenticate using Facebook and Twitter, but the number of users authenticating through those services was small and the compliance burden to maintain access through those services was deemed too high.

## Infrastructure

Infrastructure to support running of the Workforce Portal as an Azure Static Web App is implemented in Bicep files under the infra directory. The bicep files are run from GitHub Workflows.

## Related projects

https://github.com/BroadstairsFolkWeek/workforce-api - Provides the Workforce Services API used to persist data and apply business rules to forms.

https://github.com/BroadstairsFolkWeek/workforce-backoffice - A Microsoft Teams application used by Broadstairs Folk Week staff to process submitted application forms.

## Future work

It is intended for the Workforce Portal to be used to communicate assigned shifts to workforce members.

The portal can be used to provide the contact information of key people involved in running the festival. This would allow workforce members to contact their shift manager if they have any issues.

## Contributors

Created by [Watford Consulting](https://watfordconsulting.com/)
