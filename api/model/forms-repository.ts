import { Effect, Context } from "effect";
import {
  Template,
  TemplateId,
  FormAction,
  FormId,
  Form,
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
    ) => Effect.Effect<readonly Form[], ProfileNotFound>;

    readonly modelUpdateFormSubmission: (
      userId: string
    ) => (
      formId: FormId,
      answers: unknown
    ) => Effect.Effect<Form, FormNotFound>;

    readonly modelDeleteFormSubmission: (
      userId: string
    ) => (formId: FormId) => Effect.Effect<void, FormNotFound>;

    readonly modelActionFormSubmission: (
      userId: string
    ) => (
      formId: FormId
    ) => (
      action: FormAction
    ) => Effect.Effect<Form, FormNotFound | UnprocessableFormAction>;

    readonly modelGetCreatableFormSpecsByUserId: (
      userId: string
    ) => Effect.Effect<readonly Template[], ProfileNotFound>;

    readonly modelCreateFormSubmission: (
      userId: string
    ) => (
      templateId: TemplateId,
      answers: unknown
    ) => Effect.Effect<Form, TemplateNotFound>;
  }
>() {}
