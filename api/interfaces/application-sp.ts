import {
  AddableListItem,
  PersistedListItem,
  UpdatableListItem,
} from "./sp-items";

interface ApplicationListItem {
  ApplicationId: string;
  Telephone?: string | undefined;
  Address?: string | undefined;
  EmergencyContactName?: string | undefined;
  EmergencyContactTelephone?: string | undefined;
  PreviousVolunteer?: boolean | undefined;
  PreviousTeam?: string | undefined;
  FirstAidCertificate?: boolean | undefined;
  OccupationOrSkills?: string | undefined;
  DbsDisclosureNumber?: string | undefined;
  DbsDisclosureDate?: string | undefined;
  Camping?: boolean | undefined;
  TShirtSize?: string | undefined;
  AgeGroup?: string | undefined;
  OtherInformation?: string | undefined;
  TeamPreference1?: string | undefined;
  TeamPreference2?: string | undefined;
  TeamPreference3?: string | undefined;
  PersonsPreference?: string | undefined;
  AvailableFirstFriday: boolean;
  AvailableSaturday: boolean;
  AvailableSunday: boolean;
  AvailableMonday: boolean;
  AvailableTuesday: boolean;
  AvailableWednesday: boolean;
  AvailableThursday: boolean;
  AvailableLastFriday: boolean;
  Constraints?: string | undefined;
  WhatsApp: boolean;
  ConsentNewlifeWills: boolean;
  NewlifeHaveWillInPlace: boolean;
  NewlifeHavePoaInPlace: boolean;
  NewlifeWantFreeReview: boolean;
  AcceptedTermsAndConditions: boolean;
  PhotoId?: string | undefined;
  Version: number;
  Status: string;
  ProfileId: string;
}

export type AddableApplicationListItem = AddableListItem & ApplicationListItem;

export type UpdatableApplicationListItem = UpdatableListItem &
  Partial<ApplicationListItem>;

export type PersistedApplicationListItem = PersistedListItem &
  ApplicationListItem;
