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
export type FormSubmissionArchiveStatus = S.Schema.Type<
  typeof FormSubmissionArchiveStatus
>;

export const FormSubmissionAvailableActions = S.Literal(
  "save",
  "submit",
  "retract"
);
export type FormSubmissionAvailableActions = S.Schema.Type<
  typeof FormSubmissionAvailableActions
>;

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

export const FormSubmission = S.Struct({
  id: FormSubmissionId,
  formSpecId: FormSpecId,
  profileId: ModelProfileId,
  answers: S.Unknown,
  submissionStatus: FormSubmissionStatus,
  archiveStatus: FormSubmissionArchiveStatus,
  formSpec: FormSpec,
});

export interface FormSubmission extends S.Schema.Type<typeof FormSubmission> {}
