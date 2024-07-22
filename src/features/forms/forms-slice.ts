import { Effect } from "effect";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  FormSubmission,
  FormSubmissionAction,
  FormSubmissionId,
} from "../../interfaces/form";
import { Application } from "../../interfaces/application";
import { RootState } from "../../store";
import { apiActionForm, apiDeleteForm, apiSaveForm } from "../../api/forms";

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
  forms: readonly FormSubmission[];
  application?: Application;
  formsLoadingStatus: FormsLoadingStatus;
  formsLoadingEror?: string;
  formsSavingStatus: FormsSavingStatus;
  formsSavingError?: string;
}

interface SetFormsPayload {
  forms: readonly FormSubmission[];
  application?: Application;
}

type SaveExistingFormSubmissionFullfilledPayload =
  | {
      result: "success";
      formSubmission: FormSubmission;
    }
  | {
      result: "failure";
      formsSavingStatus: FormsSavingStatus;
      formsSavingError: string;
    };

type ActionFormSubmissionFullfilledPayload =
  | {
      result: "success";
      formSubmission: FormSubmission;
    }
  | {
      result: "failure";
      formsSavingStatus: FormsSavingStatus;
      formsSavingError: string;
    };

type DeleteFormSubmissionFullfilledPayload =
  | {
      result: "success";
      deletedFormSubmissionId: FormSubmissionId;
    }
  | {
      result: "failure";
      formsSavingStatus: FormsSavingStatus;
      formsSavingError: string;
    };

const initialState: FormsState = {
  forms: [],
  formsLoadingStatus: "loaded",
  formsSavingStatus: "saved",
};

export const saveExistingFormSubmission = createAsyncThunk<
  SaveExistingFormSubmissionFullfilledPayload,
  { answers: unknown; formSubmissionId: FormSubmissionId }
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

export const actionFormSubmission = createAsyncThunk<
  ActionFormSubmissionFullfilledPayload,
  {
    formSubmissionAction: FormSubmissionAction;
    formSubmissionId: FormSubmissionId;
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
    formSubmissionId: FormSubmissionId;
  }
>("forms/deleteFormSubmission", async ({ formSubmissionId }) => {
  const program = apiDeleteForm(formSubmissionId)
    .pipe(
      Effect.andThen({
        result: "success" as const,
        deletedFormSubmissionId: formSubmissionId,
      })
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
      if (action.payload.application) {
        state.application = action.payload.application;
      }
      state.formsLoadingStatus = "loaded";
    },
  },
  extraReducers: (builder) => {
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
export const selectFormsApplicationForm = (state: RootState) =>
  state.forms.application;
export const selectFormSubmissions = (state: RootState) => state.forms.forms;
export const selectFormSubmission =
  (formSubmissionId: FormSubmissionId) => (state: RootState) =>
    state.forms.forms.find((f) => f.id === formSubmissionId);
