import { Schema as S } from "@effect/schema";
import { ModelProfileId } from "./profile";

export const FormId = S.String.pipe(S.brand("FormId"));
export type FormId = S.Schema.Type<typeof FormId>;
export const TemplateId = S.String.pipe(S.brand("TemplateId"));
export type TemplateId = S.Schema.Type<typeof TemplateId>;

export const FormAnswersStatus = S.Literal(
  "draft",
  "submittable",
  "submitted",
  "accepted"
);
export type FormAnswersStatus = S.Schema.Type<typeof FormAnswersStatus>;

export const FormArchiveStatus = S.Literal("active", "archived");

export const FormAction = S.Literal("submit", "retract");
export type FormAction = S.Schema.Type<typeof FormAction>;

export const OtherDataRequirements = S.Struct({
  profileRequirements: S.Array(S.String),
  profilePhotoRequired: S.optional(S.Boolean),
});

export const Template = S.Struct({
  id: TemplateId,
  shortName: S.String,
  fullName: S.String,
  description: S.String,
  questions: S.Unknown,
  otherDataRequirements: OtherDataRequirements,
  status: S.Literal("draft", "active", "archived"),
});
export type Template = S.Schema.Type<typeof Template>;

export const FormAnswersModifiableStatus = S.Literal("modifiable", "locked");
export type FormAnswersModifiableStatus = S.Schema.Type<
  typeof FormAnswersModifiableStatus
>;

export const FormDeleteableStatus = S.Literal("deletable", "not-deletable");
export type FormDeleteableStatus = S.Schema.Type<typeof FormDeleteableStatus>;

export const Form = S.Struct({
  id: FormId,
  templateId: TemplateId,
  profileId: ModelProfileId,
  answers: S.Unknown,
  answersModifiable: FormAnswersModifiableStatus,
  submissionDeletable: FormDeleteableStatus,
  submissionStatus: FormAnswersStatus,
  archiveStatus: FormArchiveStatus,
  template: Template,
  availableActions: S.Array(FormAction),
  createdDateTimeUtc: S.DateFromString,
  modifiedDateTimeUtc: S.DateFromString,
});

export interface Form extends S.Schema.Type<typeof Form> {}
