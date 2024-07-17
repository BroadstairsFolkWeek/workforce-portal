import { Effect, Context } from "effect";
import { FormSubmissionWithSpecAndActions } from "./interfaces/form";

export class FormNotFound {
  readonly _tag = "FormNotFound";
}

export class FormsRepository extends Context.Tag("FormsRepository")<
  FormsRepository,
  {
    readonly modelGetFormsByUserId: (
      userId: string
    ) => Effect.Effect<readonly FormSubmissionWithSpecAndActions[]>;
  }
>() {}
