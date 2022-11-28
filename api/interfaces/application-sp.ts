import {
  AddableListItem,
  PersistedListItem,
  UpdatableListItem,
} from "./sp-items";

interface ApplicationListItem {
  ApplicationId: string;
  Telephone?: string;
  Address?: string;
  EmergencyContactName?: string;
  EmergencyContactTelephone?: string;
  PreviousVolunteer?: boolean;
  PreviousTeam?: string;
  FirstAidCertificate?: boolean;
  OccupationOrSkills?: string;
  DbsDisclosureNumber?: string;
  DbsDisclosureDate?: string;
  Camping?: boolean;
  TShirtSize?: string;
  AgeGroup?: string;
  OtherInformation?: string;
  TeamPreference1?: string;
  TeamPreference2?: string;
  TeamPreference3?: string;
  PersonsPreference?: string;
  AvailableFirstFriday: boolean;
  AvailableSaturday: boolean;
  AvailableSunday: boolean;
  AvailableMonday: boolean;
  AvailableTuesday: boolean;
  AvailableWednesday: boolean;
  AvailableThursday: boolean;
  AvailableLastFriday: boolean;
  Constraints?: string;
  WhatsApp: boolean;
  AcceptedTermsAndConditions: boolean;
  PhotoId?: string;
  Version: number;
  Status: string;
  ProfileId: string;
}

export type AddableApplicationListItem = AddableListItem & ApplicationListItem;

export type UpdatableApplicationListItem = UpdatableListItem &
  Partial<ApplicationListItem>;

export type PersistedApplicationListItem = PersistedListItem &
  ApplicationListItem;
