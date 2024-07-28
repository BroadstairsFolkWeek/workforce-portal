import { Effect } from "effect";
import {
  FormNotFound,
  FormsRepository,
  UnprocessableFormAction,
} from "../model/forms-repository";
import {
  Template,
  TemplateId,
  FormSubmissionAction,
  FormSubmissionId,
  FormSubmissionWithTemplateAndActions,
} from "../model/interfaces/form";
import { ProfileNotFound } from "../model/profiles-repository";

export const getFormsByUserId = (
  userId: string
): Effect.Effect<
  readonly FormSubmissionWithTemplateAndActions[],
  ProfileNotFound,
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
  ): Effect.Effect<
    FormSubmissionWithTemplateAndActions,
    FormNotFound,
    FormsRepository
  > =>
    FormsRepository.pipe(
      Effect.andThen((formsRepo) =>
        formsRepo.modelUpdateFormSubmission(userId)(formSubmissionId, answers)
      )
    );

export const actionFormSubmission =
  (userId: string) =>
  (formSubmissionId: FormSubmissionId) =>
  (
    action: FormSubmissionAction
  ): Effect.Effect<
    FormSubmissionWithTemplateAndActions,
    FormNotFound | UnprocessableFormAction,
    FormsRepository
  > =>
    FormsRepository.pipe(
      Effect.andThen((formsRepo) =>
        formsRepo.modelActionFormSubmission(userId)(formSubmissionId)(action)
      )
    );

export const deleteFormSubmission =
  (userId: string) =>
  (
    formSubmissionId: FormSubmissionId
  ): Effect.Effect<
    readonly Template[],
    FormNotFound | ProfileNotFound,
    FormsRepository
  > =>
    FormsRepository.pipe(
      Effect.andThen((formsRepo) =>
        formsRepo.modelDeleteFormSubmission(userId)(formSubmissionId)
      ),
      Effect.andThen(() => getCreatableFormsByUserId(userId))
    );

export const getCreatableFormsByUserId = (
  userId: string
): Effect.Effect<readonly Template[], ProfileNotFound, FormsRepository> =>
  FormsRepository.pipe(
    Effect.andThen((formsRepo) =>
      formsRepo.modelGetCreatableFormSpecsByUserId(userId)
    )
  );

export const createForm =
  (userId: string) => (formSpecId: TemplateId) => (answers: unknown) =>
    FormsRepository.pipe(
      Effect.andThen((formsRepo) =>
        formsRepo
          .modelCreateFormSubmission(userId)(formSpecId, answers)
          .pipe(
            Effect.andThen((form) =>
              getCreatableFormsByUserId(userId).pipe(
                Effect.andThen((formSpecs) => ({ form, formSpecs }))
              )
            )
          )
      )
    );
