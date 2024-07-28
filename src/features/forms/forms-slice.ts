import { Effect } from "effect";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  Template,
  TemplateId,
  Form,
  FormAction,
  FormId,
} from "../../interfaces/form";
import { RootState } from "../../store";
import {
  apiActionForm,
  apiCreateForm,
  apiDeleteForm,
  apiSaveForm,
} from "../../api/forms";

export type FormsLoadingStatus =
  | "not-authenticated"
  | "loading"
  | "loaded"
  | "error";
export type FormsSavingStatus =
  | "not-authenticated"
  | "saving"
  | "saved"
  | "error";

interface FormsState {
  forms: readonly Form[];
  creatableForms: readonly Template[];
  formsLoadingStatus: FormsLoadingStatus;
  formsLoadingEror?: string;
  formsSavingStatus: FormsSavingStatus;
  formsSavingError?: string;
}

interface SetFormsPayload {
  forms: readonly Form[];
  creatableForms: readonly Template[];
}

type SaveExistingFormSubmissionFullfilledPayload =
  | {
      result: "success";
      formSubmission: Form;
    }
  | {
      result: "failure";
      formsSavingStatus: FormsSavingStatus;
      formsSavingError: string;
    };

type NewFormFullfilledPayload =
  | {
      result: "success";
      formSubmission: Form;
      creatableForms: readonly Template[];
    }
  | {
      result: "failure";
      formsSavingStatus: FormsSavingStatus;
      formsSavingError: string;
    };

type ActionFormSubmissionFullfilledPayload =
  | {
      result: "success";
      formSubmission: Form;
    }
  | {
      result: "failure";
      formsSavingStatus: FormsSavingStatus;
      formsSavingError: string;
    };

type DeleteFormSubmissionFullfilledPayload =
  | {
      result: "success";
      deletedFormSubmissionId: FormId;
      creatableForms: readonly Template[];
    }
  | {
      result: "failure";
      formsSavingStatus: FormsSavingStatus;
      formsSavingError: string;
    };

const initialState: FormsState = {
  forms: [],
  creatableForms: [],
  formsLoadingStatus: "loaded",
  formsSavingStatus: "saved",
};

export const saveExistingFormSubmission = createAsyncThunk<
  SaveExistingFormSubmissionFullfilledPayload,
  { answers: unknown; formSubmissionId: FormId }
>("forms/saveExistingFormSubmission", async ({ formSubmissionId, answers }) => {
  const program = apiSaveForm(formSubmissionId)(answers)
    .pipe(
      Effect.andThen((savedFormSubmission) => ({
        result: "success" as const,
        formSubmission: savedFormSubmission,
      }))
    )
    .pipe(
      Effect.catchTags({
        NotAuthenticated: () =>
          Effect.succeed({
            result: "failure" as const,
            formsSavingStatus: "not-authenticated" as const,
            formsSavingError: "Not authenticated",
          }),
        ServerError: (e) =>
          Effect.succeed({
            result: "failure" as const,
            formsSavingStatus: "error" as const,
            formsSavingError: e.responseError.message,
          }),
      })
    );

  return await Effect.runPromise(program);
});

export const createFormSubmission = createAsyncThunk<
  NewFormFullfilledPayload,
  { answers: unknown; templateId: TemplateId }
>("forms/createFormSubmission", async ({ templateId: formSpecId, answers }) => {
  const program = apiCreateForm(formSpecId)(answers)
    .pipe(
      Effect.andThen((newFormResult) => ({
        result: "success" as const,
        formSubmission: newFormResult.form,
        creatableForms: newFormResult.creatableForms,
      }))
    )
    .pipe(
      Effect.catchTags({
        NotAuthenticated: () =>
          Effect.succeed({
            result: "failure" as const,
            formsSavingStatus: "not-authenticated" as const,
            formsSavingError: "Not authenticated",
          }),
        ServerError: (e) =>
          Effect.succeed({
            result: "failure" as const,
            formsSavingStatus: "error" as const,
            formsSavingError: e.responseError.message,
          }),
      })
    );

  return await Effect.runPromise(program);
});

export const actionFormSubmission = createAsyncThunk<
  ActionFormSubmissionFullfilledPayload,
  {
    formSubmissionAction: FormAction;
    formSubmissionId: FormId;
  }
>(
  "forms/actionFormSubmission",
  async ({ formSubmissionId, formSubmissionAction }) => {
    const program = apiActionForm(formSubmissionId)(formSubmissionAction)
      .pipe(
        Effect.andThen((savedFormSubmission) => ({
          result: "success" as const,
          formSubmission: savedFormSubmission,
        }))
      )
      .pipe(
        Effect.catchTags({
          NotAuthenticated: () =>
            Effect.succeed({
              result: "failure" as const,
              formsSavingStatus: "not-authenticated" as const,
              formsSavingError: "Not authenticated",
            }),
          ServerError: (e) =>
            Effect.succeed({
              result: "failure" as const,
              formsSavingStatus: "error" as const,
              formsSavingError: e.responseError.message,
            }),
        })
      );

    return await Effect.runPromise(program);
  }
);

export const deleteFormSubmission = createAsyncThunk<
  DeleteFormSubmissionFullfilledPayload,
  {
    formSubmissionId: FormId;
  }
>("forms/deleteFormSubmission", async ({ formSubmissionId }) => {
  const program = apiDeleteForm(formSubmissionId)
    .pipe(
      Effect.andThen((deleteResult) => ({
        result: "success" as const,
        deletedFormSubmissionId: formSubmissionId,
        creatableForms: deleteResult.creatableForms,
      }))
    )
    .pipe(
      Effect.catchTags({
        NotAuthenticated: () =>
          Effect.succeed({
            result: "failure" as const,
            formsSavingStatus: "not-authenticated" as const,
            formsSavingError: "Not authenticated",
          }),
        ServerError: (e) =>
          Effect.succeed({
            result: "failure" as const,
            formsSavingStatus: "error" as const,
            formsSavingError: e.responseError.message,
          }),
      })
    );

  return await Effect.runPromise(program);
});

export const formsSlice = createSlice({
  name: "forms",
  initialState,
  reducers: {
    setForms: (state, action: PayloadAction<SetFormsPayload>) => {
      state.forms = [...action.payload.forms];
      state.creatableForms = [...action.payload.creatableForms];
      state.formsLoadingStatus = "loaded";
    },
  },
  extraReducers: (builder) => {
    builder.addCase(createFormSubmission.pending, (state) => {
      state.formsSavingStatus = "saving";
    });

    builder.addCase(createFormSubmission.fulfilled, (state, action) => {
      if (action.payload.result == "success") {
        state.forms.push(action.payload.formSubmission);
        state.creatableForms = [...action.payload.creatableForms];
        state.formsSavingStatus = "saved";
      } else {
        state.formsSavingStatus = action.payload.formsSavingStatus;
        state.formsSavingError = action.payload.formsSavingError;
      }
    });

    builder.addCase(createFormSubmission.rejected, (state, action) => {
      state.formsSavingStatus = "error";
      state.formsSavingError = action.error.message;
    });

    builder.addCase(saveExistingFormSubmission.pending, (state) => {
      state.formsSavingStatus = "saving";
    });

    builder.addCase(saveExistingFormSubmission.fulfilled, (state, action) => {
      if (action.payload.result === "success") {
        const updatedFormSubmission = action.payload.formSubmission;
        const index = state.forms.findIndex(
          (f) => f.id === updatedFormSubmission.id
        );
        if (index !== -1) {
          state.forms[index] = updatedFormSubmission;
        }
        state.formsSavingStatus = "saved";
      } else {
        state.formsSavingStatus = action.payload.formsSavingStatus;
        state.formsSavingError = action.payload.formsSavingError;
      }
    });

    builder.addCase(saveExistingFormSubmission.rejected, (state, action) => {
      state.formsSavingStatus = "error";
      state.formsSavingError = action.error.message;
    });

    builder.addCase(actionFormSubmission.pending, (state) => {
      state.formsSavingStatus = "saving";
    });

    builder.addCase(actionFormSubmission.fulfilled, (state, action) => {
      if (action.payload.result === "success") {
        const updatedFormSubmission = action.payload.formSubmission;
        const index = state.forms.findIndex(
          (f) => f.id === updatedFormSubmission.id
        );
        if (index !== -1) {
          state.forms[index] = updatedFormSubmission;
        }
        state.formsSavingStatus = "saved";
      } else {
        state.formsSavingStatus = action.payload.formsSavingStatus;
        state.formsSavingError = action.payload.formsSavingError;
      }
    });

    builder.addCase(actionFormSubmission.rejected, (state, action) => {
      state.formsSavingStatus = "error";
      state.formsSavingError = action.error.message;
    });

    builder.addCase(deleteFormSubmission.pending, (state) => {
      state.formsSavingStatus = "saving";
    });

    builder.addCase(deleteFormSubmission.fulfilled, (state, action) => {
      if (action.payload.result === "success") {
        state.formsSavingStatus = "saved";
        // Delete the form submission from the list
        state.forms = state.forms.filter(
          (f) => f.id !== action.payload.deletedFormSubmissionId
        );
        state.creatableForms = [...action.payload.creatableForms];
      } else {
        state.formsSavingStatus = action.payload.formsSavingStatus;
        state.formsSavingError = action.payload.formsSavingError;
      }
    });
  },
});

export const { setForms } = formsSlice.actions;

export default formsSlice.reducer;

export const selectFormsLoadingStatus = (state: RootState) =>
  state.forms.formsLoadingStatus;
export const selectFormsSavingStatus = (state: RootState) =>
  state.forms.formsSavingStatus;
export const selectFormSubmissions = (state: RootState) => state.forms.forms;
export const selectCreatableForms = (state: RootState) =>
  state.forms.creatableForms;
export const selectFormSubmission =
  (formSubmissionId: FormSubmissionId) => (state: RootState) =>
    state.forms.forms.find((f) => f.id === formSubmissionId);
export const selectCreatableForm =
  (formSpecId: TemplateId) => (state: RootState) =>
    state.forms.creatableForms.find((f) => f.id === formSpecId);
