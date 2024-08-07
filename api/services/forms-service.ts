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

export const updateForm =
  (userId: string) =>
  (formId: FormId) =>
  (answers: unknown): Effect.Effect<Form, FormNotFound, FormsRepository> =>
    FormsRepository.pipe(
      Effect.andThen((formsRepo) =>
        formsRepo.modelUpdateForm(userId)(formId, answers)
      )
    );

export const actionForm =
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
        formsRepo.modelActionForm(userId)(formId)(action)
      )
    );

export const deleteForm =
  (userId: string) =>
  (
    formId: FormId
  ): Effect.Effect<
    readonly Template[],
    FormNotFound | ProfileNotFound,
    FormsRepository
  > =>
    FormsRepository.pipe(
      Effect.andThen((formsRepo) => formsRepo.modelDeleteForm(userId)(formId)),
      Effect.andThen(() => getCreatableFormsByUserId(userId))
    );

export const getCreatableFormsByUserId = (
  userId: string
): Effect.Effect<readonly Template[], ProfileNotFound, FormsRepository> =>
  FormsRepository.pipe(
    Effect.andThen((formsRepo) =>
      formsRepo.modelGetCreatableFormTemplatesByUserId(userId)
    )
  );

export const createForm =
  (userId: string) => (templateId: TemplateId) => (answers: unknown) =>
    FormsRepository.pipe(
      Effect.andThen((formsRepo) =>
        formsRepo
          .modelCreateForm(userId)(templateId, answers)
          .pipe(
            Effect.andThen((form) =>
              getCreatableFormsByUserId(userId).pipe(
                Effect.andThen((templates) => ({ form, templates }))
              )
            )
          )
      )
    );
