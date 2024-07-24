import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Effect } from "effect";
import { Profile, ProfileUpdate } from "../../interfaces/profile";
import { apiFetchProfile, apiSaveProfile } from "../../api/profile";
import { setForms } from "../forms/forms-slice";
import { RootState } from "../../store";

type ProfileLoadingStatus =
  | "not-authenticated"
  | "loading"
  | "loaded"
  | "error";

type ProfileSavingStatus = "not-authenticated" | "saving" | "saved" | "error";

interface FetchProfileFullfilledPayload {
  profile: Profile | undefined;
  profileLoadingStatus: ProfileLoadingStatus;
  profileLoadingError: string;
}

interface SaveProfileFullfilledPayload {
  profile: Profile | undefined;
  profileSavingStatus: ProfileSavingStatus;
  profileSavingError: string;
}

export const fetchProfile = createAsyncThunk<FetchProfileFullfilledPayload>(
  "profile/fetchProfile",
  async (_, { dispatch }) => {
    const program = apiFetchProfile()
      .pipe(
        Effect.tap((profileFetchResult) =>
          dispatch(
            setForms({
              forms: profileFetchResult.forms,
              creatableForms: profileFetchResult.creatableForms,
            })
          )
        ),
        Effect.andThen((profileFetchResult) => ({
          profile: profileFetchResult.profile,
          profileLoadingStatus: "loaded" as const,
          profileLoadingError: "",
        }))
      )
      .pipe(
        Effect.catchTags({
          NotAuthenticated: () =>
            Effect.succeed({
              profile: undefined,
              profileLoadingStatus: "not-authenticated" as const,
              profileLoadingError: "",
            }),
          ServerError: (e) =>
            Effect.succeed({
              profile: undefined,
              profileLoadingStatus: "error" as const,
              profileLoadingError: e.responseError.message,
            }),
        })
      );

    return Effect.runPromise(program);
  }
);

export const saveProfile = createAsyncThunk<
  SaveProfileFullfilledPayload,
  { version: number; updates: ProfileUpdate }
>("profile/saveProfile", async ({ version, updates }, { dispatch }) => {
  const program = apiSaveProfile(version, updates)
    .pipe(
      Effect.tap((profileFetchResult) =>
        dispatch(
          setForms({
            forms: profileFetchResult.forms,
            creatableForms: profileFetchResult.creatableForms,
          })
        )
      ),
      Effect.andThen((profileFetchResult) => ({
        profile: profileFetchResult.profile,
        profileSavingStatus: "saved" as const,
        profileSavingError: "",
      }))
    )
    .pipe(
      Effect.catchTags({
        NotAuthenticated: () =>
          Effect.succeed({
            profile: undefined,
            profileSavingStatus: "not-authenticated" as const,
            profileSavingError: "",
          }),
        ServerError: (e) =>
          Effect.succeed({
            profile: undefined,
            profileSavingStatus: "error" as const,
            profileSavingError: e.responseError.message,
          }),
        VersionConflict: () =>
          Effect.succeed({
            profile: undefined,
            profileSavingStatus: "error" as const,
            profileSavingError: "Profile version conflict",
          }),
      })
    );

  return Effect.runPromise(program);
});

export const profileSlice = createSlice({
  name: "profile",
  initialState: {
    profile: undefined as Profile | undefined,
    profileLoadingStatus: "not-authenticated" as ProfileLoadingStatus,
    profileLoadingError: undefined as string | undefined,
    profileSavingStatus: "not-authenticated" as ProfileSavingStatus,
    profileSavingError: undefined as string | undefined,
  },
  reducers: {
    setProfile: (
      state,
      action: PayloadAction<FetchProfileFullfilledPayload>
    ) => {
      state.profile = action.payload.profile;
      state.profileLoadingStatus = action.payload.profileLoadingStatus;
      state.profileLoadingError = action.payload.profileLoadingError;
    },
  },

  extraReducers: (builder) => {
    builder.addCase(fetchProfile.pending, (state) => {
      state.profileLoadingStatus = "loading";
    });

    builder.addCase(fetchProfile.fulfilled, (state, action) => {
      state.profile = action.payload.profile;
      state.profileLoadingStatus = action.payload.profileLoadingStatus;
      state.profileLoadingError = action.payload.profileLoadingError;
    });

    builder.addCase(fetchProfile.rejected, (state, action) => {
      state.profileLoadingStatus = "error";
      state.profile = undefined;
      state.profileLoadingError = action.error.message;
    });

    builder.addCase(saveProfile.pending, (state) => {
      state.profileSavingStatus = "saving";
    });

    builder.addCase(saveProfile.fulfilled, (state, action) => {
      state.profileSavingStatus = action.payload.profileSavingStatus;
      state.profileSavingError = action.payload.profileSavingError;
      if (state.profileSavingStatus === "saved") {
        state.profile = action.payload.profile;
      }
    });

    builder.addCase(saveProfile.rejected, (state, action) => {
      state.profileSavingStatus = "error";
      state.profileSavingError = action.error.message;
    });
  },
});

export default profileSlice.reducer;

export const { setProfile } = profileSlice.actions;

export const selectProfile = (state: RootState) => state.profile.profile;
export const selectProfileLoadingStatus = (state: RootState) =>
  state.profile.profileLoadingStatus;
export const selectProfileLoadingError = (state: RootState) =>
  state.profile.profileLoadingError;
export const selectProfileSavingStatus = (state: RootState) =>
  state.profile.profileSavingStatus;
export const selectProfileSavingError = (state: RootState) =>
  state.profile.profileSavingError;
