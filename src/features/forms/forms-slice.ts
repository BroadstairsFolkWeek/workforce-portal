import { Effect } from "effect";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { castDraft } from "immer";
import { RootState } from "../../store";
import {
  Template,
  TemplateId,
  Form,
  FormAction,
  FormId,
} from "../../interfaces/form";
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

type SaveExistingFormFullfilledPayload =
  | {
      result: "success";
      form: Form;
    }
  | {
      result: "failure";
      formsSavingStatus: FormsSavingStatus;
      formsSavingError: string;
    };

type NewFormFullfilledPayload =
  | {
      result: "success";
      form: Form;
      creatableForms: readonly Template[];
    }
  | {
      result: "failure";
      formsSavingStatus: FormsSavingStatus;
      formsSavingError: string;
    };

type ActionFormFullfilledPayload =
  | {
      result: "success";
      form: Form;
    }
  | {
      result: "failure";
      formsSavingStatus: FormsSavingStatus;
      formsSavingError: string;
    };

type DeleteFormFullfilledPayload =
  | {
      result: "success";
      deleteFormId: FormId;
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

export const saveExistingForm = createAsyncThunk<
  SaveExistingFormFullfilledPayload,
  { answers: unknown; formId: FormId }
>("forms/saveExistingForm", async ({ formId, answers }) => {
  const program = apiSaveForm(formId)(answers)
    .pipe(
      Effect.andThen((savedForm) => ({
        result: "success" as const,
        form: savedForm,
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

export const createForm = createAsyncThunk<
  NewFormFullfilledPayload,
  { answers: unknown; templateId: TemplateId }
>("forms/createForm", async ({ templateId, answers }) => {
  const program = apiCreateForm(templateId)(answers)
    .pipe(
      Effect.andThen((newFormResult) => ({
        result: "success" as const,
        form: newFormResult.form,
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

export const actionForm = createAsyncThunk<
  ActionFormFullfilledPayload,
  {
    formAction: FormAction;
    formId: FormId;
  }
>("forms/actionForm", async ({ formId, formAction }) => {
  const program = apiActionForm(formId)(formAction)
    .pipe(
      Effect.andThen((savedForm) => ({
        result: "success" as const,
        form: savedForm,
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

export const deleteForm = createAsyncThunk<
  DeleteFormFullfilledPayload,
  {
    formId: FormId;
  }
>("forms/deleteForm", async ({ formId: formId }) => {
  const program = apiDeleteForm(formId)
    .pipe(
      Effect.andThen((deleteResult) => ({
        result: "success" as const,
        deleteFormId: formId,
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
      state.forms = castDraft(action.payload.forms);
      state.creatableForms = castDraft(action.payload.creatableForms);
      state.formsLoadingStatus = "loaded";
    },
  },
  extraReducers: (builder) => {
    builder.addCase(createForm.pending, (state) => {
      state.formsSavingStatus = "saving";
    });

    builder.addCase(createForm.fulfilled, (state, action) => {
      if (action.payload.result == "success") {
        state.forms.push(castDraft(action.payload.form));
        state.creatableForms = castDraft(action.payload.creatableForms);
        state.formsSavingStatus = "saved";
      } else {
        state.formsSavingStatus = action.payload.formsSavingStatus;
        state.formsSavingError = action.payload.formsSavingError;
      }
    });

    builder.addCase(createForm.rejected, (state, action) => {
      state.formsSavingStatus = "error";
      state.formsSavingError = action.error.message;
    });

    builder.addCase(saveExistingForm.pending, (state) => {
      state.formsSavingStatus = "saving";
    });

    builder.addCase(saveExistingForm.fulfilled, (state, action) => {
      if (action.payload.result === "success") {
        const updatedForm = action.payload.form;
        const index = state.forms.findIndex((f) => f.id === updatedForm.id);
        if (index !== -1) {
          state.forms[index] = castDraft(updatedForm);
        }
        state.formsSavingStatus = "saved";
      } else {
        state.formsSavingStatus = action.payload.formsSavingStatus;
        state.formsSavingError = action.payload.formsSavingError;
      }
    });

    builder.addCase(saveExistingForm.rejected, (state, action) => {
      state.formsSavingStatus = "error";
      state.formsSavingError = action.error.message;
    });

    builder.addCase(actionForm.pending, (state) => {
      state.formsSavingStatus = "saving";
    });

    builder.addCase(actionForm.fulfilled, (state, action) => {
      if (action.payload.result === "success") {
        const updatedForm = action.payload.form;
        const index = state.forms.findIndex((f) => f.id === updatedForm.id);
        if (index !== -1) {
          state.forms[index] = castDraft(updatedForm);
        }
        state.formsSavingStatus = "saved";
      } else {
        state.formsSavingStatus = action.payload.formsSavingStatus;
        state.formsSavingError = action.payload.formsSavingError;
      }
    });

    builder.addCase(actionForm.rejected, (state, action) => {
      state.formsSavingStatus = "error";
      state.formsSavingError = action.error.message;
    });

    builder.addCase(deleteForm.pending, (state) => {
      state.formsSavingStatus = "saving";
    });

    builder.addCase(deleteForm.fulfilled, (state, action) => {
      if (action.payload.result === "success") {
        const deletedFormId = action.payload.deleteFormId;
        state.formsSavingStatus = "saved";
        // Delete the form submission from the list
        state.forms = state.forms.filter((f) => f.id !== deletedFormId);
        state.creatableForms = castDraft(action.payload.creatableForms);
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
export const selectForms = (state: RootState) => state.forms.forms;
export const selectCreatableForms = (state: RootState) =>
  state.forms.creatableForms;
export const selectForm = (formId: FormId) => (state: RootState) =>
  state.forms.forms.find((f) => f.id === formId);
export const selectCreatableForm =
  (templateId: TemplateId) => (state: RootState) =>
    state.forms.creatableForms.find((f) => f.id === templateId);
