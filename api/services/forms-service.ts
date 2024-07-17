import { Effect } from "effect";
import { FormsRepository } from "../model/forms-repository";
import { FormSubmissionWithSpecAndActions } from "../model/interfaces/form";

export const getFormsByUserId = (
  userId: string
): Effect.Effect<
  readonly FormSubmissionWithSpecAndActions[],
  never,
  FormsRepository
> =>
  FormsRepository.pipe(
    Effect.andThen((formsRepo) => formsRepo.modelGetFormsByUserId(userId))
  );
