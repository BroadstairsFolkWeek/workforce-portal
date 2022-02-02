import { AddableApplication, Application } from "../interfaces/application";
import {
  AddableApplicationListItem,
  PersistedApplicationListItem,
} from "../interfaces/application-sp";
import { AddableListItem } from "../interfaces/sp-items";
import { getWorkforcePortalConfig } from "./configuration-service";
import { applyToItemsByFilter, createItem, updateItem } from "./sp-service";

const workforcePortalConfig = getWorkforcePortalConfig();
const workforceSiteUrl = workforcePortalConfig.spSiteUrl;
const applicationsListGuid = workforcePortalConfig.spApplicationsListGuid;

export const getUserApplication = async (
  userId: string
): Promise<Application | null> => {
  const users = await getApplicationsByFilters(
    `IdentityProviderUserId eq '${userId}'`
  );
  if (users?.length) {
    return users[0];
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

const listItemToApplication = (
  item: PersistedApplicationListItem
): Application => {
  return {
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
    version: item.Version,
    dbId: item.ID,
    identityProviderUserId: item.IdentityProviderUserId,
    userDetails: item.Title,
  };
};

const setOnListItemIfDefined = <T extends AddableListItem>(
  listItem: T,
  column: keyof T,
  value: any
) => {
  if (value !== undefined) {
    listItem[column] = value;
  }
};

const addableApplicationToListItem = (
  application: AddableApplication
): AddableApplicationListItem => {
  const listItem = {
    Title: application.userDetails,
    IdentityProviderUserId: application.identityProviderUserId,
    Version: application.version,
  };

  setOnListItemIfDefined<AddableApplicationListItem>(
    listItem,
    "Telephone",
    application.telephone
  );
  setOnListItemIfDefined<AddableApplicationListItem>(
    listItem,
    "Address",
    application.address
  );
  setOnListItemIfDefined<AddableApplicationListItem>(
    listItem,
    "EmergencyContactName",
    application.emergencyContactName
  );
  setOnListItemIfDefined<AddableApplicationListItem>(
    listItem,
    "EmergencyContactTelephone",
    application.emergencyContactTelephone
  );

  return listItem;
};

export const getApplicationsByFilters = async (
  filter?: string
): Promise<Application[]> => {
  return applyToItemsByFilter<PersistedApplicationListItem, Application[]>(
    workforceSiteUrl,
    applicationsListGuid,
    (items: PersistedApplicationListItem[]) => {
      return Promise.resolve(items.map(listItemToApplication));
    },
    filter
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
