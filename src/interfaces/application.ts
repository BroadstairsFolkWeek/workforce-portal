export interface Application {
  telephone?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactTelephone?: string;
  previousVolunteer?: boolean;
  previousTeam?: string;
  firstAidCertificate?: boolean;
  occupationOrSkills?: string;
  dbsDisclosureNumber?: string;
  dbsDisclosureDate?: string;
  camping?: boolean;
  tShirtSize?: string;
  ageGroup?: string;
  otherInformation?: string;
  teamPreference1?: string;
  teamPreference2?: string;
  teamPreference3?: string;
  personsPreference?: string;
  version: number;
}
