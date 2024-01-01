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
  ageGroup?: "18-20" | "21-25" | "26-35" | "36-55" | "56-65" | "66+";
  otherInformation?: string;
  teamPreference1?: string;
  teamPreference2?: string;
  teamPreference3?: string;
  personsPreference?: string;
  availableFirstFriday: boolean;
  availableSaturday: boolean;
  availableSunday: boolean;
  availableMonday: boolean;
  availableTuesday: boolean;
  availableWednesday: boolean;
  availableThursday: boolean;
  availableLastFriday: boolean;
  constraints?: string;
  whatsApp?: boolean;
  consentNewlifeWills: boolean;
  newlifeHaveWillInPlace: boolean;
  newlifeHavePoaInPlace: boolean;
  newlifeWantFreeReview: boolean;
  acceptedTermsAndConditions?: boolean;
  version: number;
  lastSaved: string;
  status:
    | "info-required"
    | "profile-required"
    | "photo-required"
    | "documents-required"
    | "ready-to-submit"
    | "submitted"
    | "complete";
}
