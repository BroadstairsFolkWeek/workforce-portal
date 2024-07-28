import { Effect, Context } from "effect";
import {
  Template,
  TemplateId,
  FormSubmissionAction,
  FormSubmissionId,
  FormSubmissionWithTemplateAndActions,
} from "./interfaces/form";
import { ProfileNotFound } from "./profiles-repository";

export class FormNotFound {
  readonly _tag = "FormNotFound";
}

export class TemplateNotFound {
  readonly _tag = "TemplateNotFound";
}

export class UnprocessableFormAction {
  readonly _tag = "UnprocessableFormAction";
}

export class FormsRepository extends Context.Tag("FormsRepository")<
  FormsRepository,
  {
    readonly modelGetFormsByUserId: (
      userId: string
    ) => Effect.Effect<
      readonly FormSubmissionWithTemplateAndActions[],
      ProfileNotFound
    >;

    readonly modelUpdateFormSubmission: (
      userId: string
    ) => (
      formSubmissionId: FormSubmissionId,
      answers: unknown
    ) => Effect.Effect<FormSubmissionWithTemplateAndActions, FormNotFound>;

    readonly modelDeleteFormSubmission: (
      userId: string
    ) => (
      formSubmissionId: FormSubmissionId
    ) => Effect.Effect<void, FormNotFound>;

    readonly modelActionFormSubmission: (
      userId: string
    ) => (
      formSubmissionId: FormSubmissionId
    ) => (
      action: FormSubmissionAction
    ) => Effect.Effect<
      FormSubmissionWithTemplateAndActions,
      FormNotFound | UnprocessableFormAction
    >;

    readonly modelGetCreatableFormSpecsByUserId: (
      userId: string
    ) => Effect.Effect<readonly Template[], ProfileNotFound>;

    readonly modelCreateFormSubmission: (
      userId: string
    ) => (
      templateId: TemplateId,
      answers: unknown
    ) => Effect.Effect<FormSubmissionWithTemplateAndActions, TemplateNotFound>;
  }
>() {}
