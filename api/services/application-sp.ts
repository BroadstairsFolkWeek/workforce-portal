import { AddableApplication, Application } from "../interfaces/application";
import {
  AddableApplicationListItem,
  PersistedApplicationListItem,
} from "../interfaces/application-sp";
import { OrderBySpec } from "../interfaces/sp-items";
import { getWorkforcePortalConfig } from "./configuration-service";
import {
  applyToItemsByFilter,
  createItem,
  deleteItem,
  updateItem,
} from "./sp-service";

const workforcePortalConfig = getWorkforcePortalConfig();
const workforceSiteUrl = workforcePortalConfig.spSiteUrl;
const applicationsListGuid = workforcePortalConfig.spApplicationsListGuid;

export const getApplicationByProfileId = async (
  profileId: string
): Promise<Application | null> => {
  const applications = await getApplicationsByFilters(
    `ProfileId eq '${profileId}'`
  );
  if (applications?.length) {
    return applications[0];
  } else {
    return null;
  }
};

const listItemToTShirtSize = (
  item: PersistedApplicationListItem
): Application["tShirtSize"] => {
  switch (item.TShirtSize) {
    case "S":
    case "M":
    case "L":
    case "XL":
    case "XXL":
    case null:
      return item.TShirtSize;
    default:
      throw new Error(
        "Invalid TShirtSize read from PersistedApplicationListItem: " +
          item.TShirtSize
      );
  }
};

const listItemToAgeGroup = (
  item: PersistedApplicationListItem
): Application["ageGroup"] => {
  switch (item.AgeGroup) {
    case "18-20":
    case "21-25":
    case "26-35":
    case "36-55":
    case "56-65":
    case "66+":
    case null:
      return item.AgeGroup;
    default:
      throw new Error(
        "Invalid AgeGroup read from PersistedApplicationListItem: " +
          item.AgeGroup
      );
  }
};

const listItemToStatus = (
  item: PersistedApplicationListItem
): Application["status"] => {
  switch (item.Status) {
    case "info-required":
    case "profile-required":
    case "photo-required":
    case "documents-required":
    case "ready-to-submit":
    case "submitted":
    case "complete":
      return item.Status;
    default:
      throw new Error(
        "Invalid Status read from PersistedApplicationListItem: " + item.Status
      );
  }
};

const listItemToApplication = (
  item: PersistedApplicationListItem
): Application => {
  return {
    applicationId: item.ApplicationId,
    title: item.Title,
    telephone: item.Telephone ?? undefined,
    address: item.Address ?? undefined,
    emergencyContactName: item.EmergencyContactName ?? undefined,
    emergencyContactTelephone: item.EmergencyContactTelephone ?? undefined,
    previousVolunteer: item.PreviousVolunteer ?? undefined,
    previousTeam: item.PreviousTeam ?? undefined,
    firstAidCertificate: item.FirstAidCertificate ?? undefined,
    occupationOrSkills: item.OccupationOrSkills ?? undefined,
    dbsDisclosureNumber: item.DbsDisclosureNumber ?? undefined,
    dbsDisclosureDate: item.DbsDisclosureDate ?? undefined,
    camping: item.Camping ?? undefined,
    tShirtSize: listItemToTShirtSize(item) ?? undefined,
    ageGroup: listItemToAgeGroup(item) ?? undefined,
    otherInformation: item.OtherInformation ?? undefined,
    teamPreference1: item.TeamPreference1 ?? undefined,
    teamPreference2: item.TeamPreference2 ?? undefined,
    teamPreference3: item.TeamPreference3 ?? undefined,
    personsPreference: item.PersonsPreference ?? undefined,
    photoId: item.PhotoId ?? undefined,
    availableFirstFriday: item.AvailableFirstFriday,
    availableSaturday: item.AvailableSaturday,
    availableSunday: item.AvailableSunday,
    availableMonday: item.AvailableMonday,
    availableTuesday: item.AvailableTuesday,
    availableWednesday: item.AvailableWednesday,
    availableThursday: item.AvailableThursday,
    availableLastFriday: item.AvailableLastFriday,
    constraints: item.Constraints,
    whatsApp: item.WhatsApp,
    consentNewlifeWills: item.ConsentNewlifeWills ?? false,
    newlifeHaveWillInPlace: item.NewlifeHaveWillInPlace ?? false,
    newlifeHavePoaInPlace: item.NewlifeHavePoaInPlace ?? false,
    newlifeWantFreeReview: item.NewlifeWantFreeReview ?? false,
    acceptedTermsAndConditions: item.AcceptedTermsAndConditions ?? false,
    version: item.Version,
    profileId: item.ProfileId,
    dbId: item.ID,
    lastSaved: item.Modified,
    status: listItemToStatus(item),
  };
};

const addableApplicationToListItem = (
  application: AddableApplication
): AddableApplicationListItem => {
  const listItem: AddableApplicationListItem = {
    ApplicationId: application.applicationId,
    Title: application.title,
    ProfileId: application.profileId,
    Version: application.version,
    Status: application.status,
    Telephone: application.telephone,
    Address: application.address,
    AgeGroup: application.ageGroup as string,
    TShirtSize: application.tShirtSize as string,
    EmergencyContactName: application.emergencyContactName,
    EmergencyContactTelephone: application.emergencyContactTelephone,
    PreviousVolunteer: application.previousVolunteer,
    PreviousTeam: application.previousTeam,
    FirstAidCertificate: application.firstAidCertificate,
    OccupationOrSkills: application.occupationOrSkills,
    DbsDisclosureNumber: application.dbsDisclosureNumber,
    DbsDisclosureDate: application.dbsDisclosureDate,
    Camping: application.camping,
    OtherInformation: application.otherInformation,
    TeamPreference1: application.teamPreference1,
    TeamPreference2: application.teamPreference2,
    TeamPreference3: application.teamPreference3,
    PersonsPreference: application.personsPreference,
    AvailableFirstFriday: application.availableFirstFriday,
    AvailableSaturday: application.availableSaturday,
    AvailableSunday: application.availableSunday,
    AvailableMonday: application.availableMonday,
    AvailableTuesday: application.availableTuesday,
    AvailableWednesday: application.availableWednesday,
    AvailableThursday: application.availableThursday,
    AvailableLastFriday: application.availableLastFriday,
    Constraints: application.constraints,
    WhatsApp: application.whatsApp,
    ConsentNewlifeWills: application.consentNewlifeWills,
    NewlifeHaveWillInPlace: application.newlifeHaveWillInPlace,
    NewlifeHavePoaInPlace: application.newlifeHavePoaInPlace,
    NewlifeWantFreeReview: application.newlifeWantFreeReview,
    AcceptedTermsAndConditions: application.acceptedTermsAndConditions,
    PhotoId: application.photoId,
  };

  if (listItem.DbsDisclosureDate !== undefined) {
    if (listItem.DbsDisclosureDate.length === 0) {
      delete listItem.DbsDisclosureDate;
    }
  }

  return listItem;
};

export const getApplicationsByFilters = async (
  filter?: string,
  orderBy?: OrderBySpec[]
): Promise<Application[]> => {
  return applyToItemsByFilter<PersistedApplicationListItem, Application>(
    workforceSiteUrl,
    applicationsListGuid,
    (items: PersistedApplicationListItem[]) => {
      return Promise.resolve(items.map(listItemToApplication));
    },
    filter,
    orderBy
  );
};

export const updateApplicationListItem = async (
  application: Application
): Promise<Application> => {
  const listItem = addableApplicationToListItem(application);
  await updateItem(
    workforceSiteUrl,
    applicationsListGuid,
    application.dbId,
    listItem
  );
  return application;
};

export const createApplicationListItem = async (
  application: AddableApplication
): Promise<Application> => {
  const addResult = await createItem<AddableApplicationListItem>(
    workforceSiteUrl,
    applicationsListGuid,
    addableApplicationToListItem(application)
  );
  return listItemToApplication(addResult.data);
};

export const deleteApplicationListItem = async (
  application: Application
): Promise<void> => {
  return deleteItem(workforceSiteUrl, applicationsListGuid, application.dbId);
};
