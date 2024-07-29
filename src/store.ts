import { configureStore } from "@reduxjs/toolkit";
import profileReducer from "./features/profile/profile-slice";
import formsReducer from "./features/forms/forms-slice";

const store = configureStore({
  reducer: {
    profile: profileReducer,
    forms: formsReducer,
  },
});

export type AppStore = typeof store;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = typeof store.dispatch;
export default store;
