import {
  Boolean,
  Number,
  String,
  Literal,
  Record,
  Union,
  Static,
  Optional,
} from "runtypes";

export const TShirtSizeRunType = Union(
  Literal("S"),
  Literal("M"),
  Literal("L"),
  Literal("XL"),
  Literal("XXL")
);

export const AgeGroupRunType = Union(
  Literal("18-20"),
  Literal("21-25"),
  Literal("26-35"),
  Literal("36-55"),
  Literal("56-65"),
  Literal("66+")
);

// Application Data Transfer Object for data posted to the API.
export const ApplicationDtoRunType = Record({
  telephone: Optional(String),
  address: Optional(String),
  emergencyContactName: Optional(String),
  emergencyContactTelephone: Optional(String),
  previousVolunteer: Optional(Boolean),
  previousTeam: Optional(String),
  firstAidCertificate: Optional(Boolean),
  occupationOrSkills: Optional(String),
  dbsDisclosureNumber: Optional(String),
  dbsDisclosureDate: Optional(String),
  camping: Optional(Boolean),
  tShirtSize: Optional(TShirtSizeRunType),
  ageGroup: Optional(AgeGroupRunType),
  otherInformation: Optional(String),
  teamPreference1: Optional(String),
  teamPreference2: Optional(String),
  teamPreference3: Optional(String),
  personsPreference: Optional(String),
  availableFirstFriday: Boolean,
  availableSaturday: Boolean,
  availableSunday: Boolean,
  availableMonday: Boolean,
  availableTuesday: Boolean,
  availableWednesday: Boolean,
  availableThursday: Boolean,
  availableLastFriday: Boolean,
  constraints: Optional(String),
  whatsApp: Boolean,
  consentNewlifeWills: Boolean,
  newlifeHaveWillInPlace: Boolean,
  newlifeHavePoaInPlace: Boolean,
  newlifeWantFreeReview: Boolean,
  acceptedTermsAndConditions: Boolean,
  version: Number,
});

export type ApplicationDto = Static<typeof ApplicationDtoRunType>;

export type AddableApplication = ApplicationDto & {
  title: string;
  applicationId: string;
  profileId: string;
  photoId?: string | undefined;
  status:
    | "info-required"
    | "profile-required"
    | "photo-required"
    | "documents-required"
    | "ready-to-submit"
    | "submitted"
    | "complete";
};

export type UpdatableApplication = Partial<AddableApplication>;

export type Application = AddableApplication & {
  dbId: number;
  lastSaved: string;
};
