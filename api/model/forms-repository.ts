import { Effect, Context } from "effect";
import {
  FormSpec,
  FormSpecId,
  FormSubmissionAction,
  FormSubmissionId,
  FormSubmissionWithSpecAndActions,
} from "./interfaces/form";
import { ProfileNotFound } from "./profiles-repository";

export class FormNotFound {
  readonly _tag = "FormNotFound";
}

export class FormSpecNotFound {
  readonly _tag = "FormSpecNotFound";
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
      readonly FormSubmissionWithSpecAndActions[],
      ProfileNotFound
    >;

    readonly modelUpdateFormSubmission: (
      userId: string
    ) => (
      formSubmissionId: FormSubmissionId,
      answers: unknown
    ) => Effect.Effect<FormSubmissionWithSpecAndActions, FormNotFound>;

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
      FormSubmissionWithSpecAndActions,
      FormNotFound | UnprocessableFormAction
    >;

    readonly modelGetCreatableFormSpecsByUserId: (
      userId: string
    ) => Effect.Effect<readonly FormSpec[], ProfileNotFound>;

    readonly modelCreateFormSubmission: (
      userId: string
    ) => (
      formSpecId: FormSpecId,
      answers: unknown
    ) => Effect.Effect<FormSubmissionWithSpecAndActions, FormSpecNotFound>;
  }
>() {}
