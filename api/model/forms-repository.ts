import { Effect, Context } from "effect";
import {
  FormSubmissionId,
  FormSubmissionWithSpecAndActions,
} from "./interfaces/form";

export class FormNotFound {
  readonly _tag = "FormNotFound";
}

export class FormsRepository extends Context.Tag("FormsRepository")<
  FormsRepository,
  {
    readonly modelGetFormsByUserId: (
      userId: string
    ) => Effect.Effect<readonly FormSubmissionWithSpecAndActions[]>;

    readonly modelUpdateFormSubmission: (
      userId: string
    ) => (
      formSubmissionId: FormSubmissionId,
      answers: unknown
    ) => Effect.Effect<FormSubmissionWithSpecAndActions>;
  }
>() {}
