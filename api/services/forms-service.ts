import { Effect } from "effect";
import { FormsRepository } from "../model/forms-repository";
import {
  FormSubmissionId,
  FormSubmissionWithSpecAndActions,
} from "../model/interfaces/form";

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

export const updateFormSubmission =
  (userId: string) =>
  (formSubmissionId: FormSubmissionId) =>
  (
    answers: unknown
  ): Effect.Effect<FormSubmissionWithSpecAndActions, never, FormsRepository> =>
    FormsRepository.pipe(
      Effect.andThen((formsRepo) =>
        formsRepo.modelUpdateFormSubmission(userId)(formSubmissionId, answers)
      )
    );
