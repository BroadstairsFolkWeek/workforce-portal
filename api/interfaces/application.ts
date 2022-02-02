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
  version: Number,
});

export type ApplicationDto = Static<typeof ApplicationDtoRunType>;

export type AddableApplication = ApplicationDto & {
  photoFileName?: string;
  identityProviderUserId: string;
  userDetails: string;
};

export type UpdatableApplication = Partial<AddableApplication>;

export type Application = AddableApplication & {
  dbId: number;
};