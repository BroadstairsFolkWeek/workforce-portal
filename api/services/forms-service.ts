import { Effect } from "effect";
import {
  FormNotFound,
  FormsRepository,
  UnprocessableFormAction,
} from "../model/forms-repository";
import {
  Template,
  TemplateId,
  FormAction,
  FormId,
  Form,
} from "../model/interfaces/form";
import { ProfileNotFound } from "../model/profiles-repository";

export const getFormsByUserId = (
  userId: string
): Effect.Effect<readonly Form[], ProfileNotFound, FormsRepository> =>
  FormsRepository.pipe(
    Effect.andThen((formsRepo) => formsRepo.modelGetFormsByUserId(userId))
  );

export const updateFormSubmission =
  (userId: string) =>
  (formId: FormId) =>
  (answers: unknown): Effect.Effect<Form, FormNotFound, FormsRepository> =>
    FormsRepository.pipe(
      Effect.andThen((formsRepo) =>
        formsRepo.modelUpdateFormSubmission(userId)(formId, answers)
      )
    );

export const actionFormSubmission =
  (userId: string) =>
  (formId: FormId) =>
  (
    action: FormAction
  ): Effect.Effect<
    Form,
    FormNotFound | UnprocessableFormAction,
    FormsRepository
  > =>
    FormsRepository.pipe(
      Effect.andThen((formsRepo) =>
        formsRepo.modelActionFormSubmission(userId)(formId)(action)
      )
    );

export const deleteFormSubmission =
  (userId: string) =>
  (
    formId: FormId
  ): Effect.Effect<
    readonly Template[],
    FormNotFound | ProfileNotFound,
    FormsRepository
  > =>
    FormsRepository.pipe(
      Effect.andThen((formsRepo) =>
        formsRepo.modelDeleteFormSubmission(userId)(formId)
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
