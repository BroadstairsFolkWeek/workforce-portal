import { Effect } from "effect";
import { FormsRepository } from "../model/forms-repository";
import {
  FormSubmissionAction,
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

export const actionFormSubmission =
  (userId: string) =>
  (formSubmissionId: FormSubmissionId) =>
  (action: FormSubmissionAction) =>
    FormsRepository.pipe(
      Effect.andThen((formsRepo) =>
        formsRepo.modelActionFormSubmission(userId)(formSubmissionId)(action)
      )
    );

export const deleteFormSubmission =
  (userId: string) => (formSubmissionId: FormSubmissionId) =>
    FormsRepository.pipe(
      Effect.andThen((formsRepo) =>
        formsRepo.modelDeleteFormSubmission(userId)(formSubmissionId)
      )
    );
