import { Effect } from "effect";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FormSubmission } from "../../interfaces/form";
import { Application } from "../../interfaces/application";
import { RootState } from "../../store";
import { ApplicationUpdate } from "../../components/contexts/EditApplicationContext";
import { apiSaveApplication } from "../../api/forms";

type FormsLoadingStatus = "not-authenticated" | "loading" | "loaded" | "error";
type FormsSavingStatus = "not-authenticated" | "saving" | "saved" | "error";

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

type SaveApplicationFullfilledPayload =
  | {
      result: "success";
      application: Application;
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

export const saveNewOrExistingApplication = createAsyncThunk<
  SaveApplicationFullfilledPayload,
  { updates: ApplicationUpdate; mode: "new" | "existing" },
  {
    state: RootState;
  }
>("forms/saveNewOrExistingApplication", async (updateRequest, { getState }) => {
  const applicationUpdate = updateRequest.updates;
  const mode = updateRequest.mode;

  let applicationToSave: Application;

  if (mode === "new") {
    applicationToSave = {
      camping: false,
      tShirtSize: undefined,
      ageGroup: undefined,
      otherInformation: "",
      teamPreference3: "",
      personsPreference: "",
      version: 0,
      lastSaved: "",
      status: "info-required",
      whatsApp: true,
      acceptedTermsAndConditions: false,
      ...applicationUpdate,
    };
  } else {
    const existingApplication = getState().forms.application;
    if (!existingApplication) {
      throw new Error("No application to save");
    }

    applicationToSave = {
      ...existingApplication,
      ...applicationUpdate,
      version: existingApplication?.version || 0,
    };
  }

  const program = apiSaveApplication(applicationToSave)
    .pipe(
      Effect.andThen((savedApplication) => ({
        result: "success" as const,
        application: savedApplication,
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
        VersionConflict: () =>
          Effect.succeed({
            result: "failure" as const,
            formsSavingStatus: "error" as const,
            formsSavingError: "Application version conflict",
          }),
      })
    );

  return Effect.runPromise(program);
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
    builder.addCase(saveNewOrExistingApplication.pending, (state) => {
      state.formsSavingStatus = "saving";
    });

    builder.addCase(saveNewOrExistingApplication.fulfilled, (state, action) => {
      if (action.payload.result === "success") {
        state.application = action.payload.application;
        state.formsSavingStatus = "saved";
      } else {
        state.formsSavingStatus = action.payload.formsSavingStatus;
        state.formsSavingError = action.payload.formsSavingError;
      }
    });

    builder.addCase(saveNewOrExistingApplication.rejected, (state, action) => {
      state.formsSavingStatus = "error";
      state.formsSavingError = action.error.message;
    });
  },
});

export const { setForms } = formsSlice.actions;

export default formsSlice.reducer;

export const selectFormsLoadingStatus = (state: RootState) =>
  state.forms.formsLoadingStatus;
export const selectFormsApplicationForm = (state: RootState) =>
  state.forms.application;
export const selectFormSubmissions = (state: RootState) => state.forms.forms;
