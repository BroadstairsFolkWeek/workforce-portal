import { Schema as S } from "@effect/schema";
import { ModelProfileId } from "./profile";

export const FormSubmissionId = S.String.pipe(S.brand("FormSubmissionId"));
export type FormSubmissionId = S.Schema.Type<typeof FormSubmissionId>;
export const FormSpecId = S.String.pipe(S.brand("FormSpecId"));
export type FormSpecId = S.Schema.Type<typeof FormSpecId>;

export const FormSubmissionStatus = S.Literal(
  "draft",
  "submittable",
  "submitted",
  "accepted"
);
export type FormSubmissionStatus = S.Schema.Type<typeof FormSubmissionStatus>;

export const FormSubmissionArchiveStatus = S.Literal("active", "archived");

export const FormSubmissionAction = S.Literal("submit", "retract");
export type FormSubmissionAction = S.Schema.Type<typeof FormSubmissionAction>;

export const FormSpecRequirements = S.Struct({
  profileRequirements: S.Struct({
    firstName: S.optional(S.Boolean),
    surname: S.optional(S.Boolean),
    displayName: S.optional(S.Boolean),
    address: S.optional(S.Boolean),
    telephone: S.optional(S.Boolean),
    email: S.optional(S.Boolean),
    photo: S.optional(S.Boolean),
  }),
});

export const FormSpec = S.Struct({
  id: FormSpecId,
  shortName: S.String,
  fullName: S.String,
  description: S.String,
  questions: S.Unknown,
  requirements: FormSpecRequirements,
  status: S.Literal("draft", "active", "archived"),
});
export type FormSpec = S.Schema.Type<typeof FormSpec>;

export const FormAnswersModifiableStatus = S.Literal("modifiable", "locked");
export type FormAnswersModifiableStatus = S.Schema.Type<
  typeof FormAnswersModifiableStatus
>;

export const FormSubmissionDeleteableStatus = S.Literal(
  "deletable",
  "not-deletable"
);
export type FormSubmissionDeleteableStatus = S.Schema.Type<
  typeof FormSubmissionDeleteableStatus
>;

export const FormSubmissionWithSpecAndActions = S.Struct({
  id: FormSubmissionId,
  formSpecId: FormSpecId,
  profileId: ModelProfileId,
  answers: S.Unknown,
  answersModifiable: FormAnswersModifiableStatus,
  submissionDeletable: FormSubmissionDeleteableStatus,
  submissionStatus: FormSubmissionStatus,
  archiveStatus: FormSubmissionArchiveStatus,
  formSpec: FormSpec,
  availableActions: S.Array(FormSubmissionAction),
  createdDateTimeUtc: S.DateFromString,
  modifiedDateTimeUtc: S.DateFromString,
});

export interface FormSubmissionWithSpecAndActions
  extends S.Schema.Type<typeof FormSubmissionWithSpecAndActions> {}
