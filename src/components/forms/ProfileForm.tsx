import {
  DefaultButton,
  Dialog,
  DialogFooter,
  DialogType,
  IDialogContentProps,
  MessageBar,
  MessageBarType,
  PrimaryButton,
} from "@fluentui/react";
import { Formik } from "formik";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ErrorRenderer } from "../../interfaces/error-renderer";
import { SaveProfileConflictError } from "../errors/user-profile-errors";
import PageLayout from "../PageLayout";
import { TextArea, TextInput } from "./Fields";
import { useDispatch, useSelector } from "react-redux";
import {
  saveProfile,
  selectProfile,
} from "../../features/profile/profile-slice";
import { ProfileUpdate } from "../../interfaces/profile";
import { AppDispatch } from "../../store";
import { Either } from "effect";

export interface ProfileFormProps {}

const deleteDialogContentProps: IDialogContentProps = {
  type: DialogType.normal,
  title: "Delete your profile?",
  closeButtonAriaLabel: "Close",
};

const dialogStyles = { main: { maxWidth: 450 } };

const modalProps = {
  isBlocking: false,
  styles: dialogStyles,
  dragOptions: undefined,
};

const ProfileForm: React.FC<ProfileFormProps> = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<ErrorRenderer | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const dispatch: AppDispatch = useDispatch();
  const userProfile = useSelector(selectProfile);

  const initialValues: ProfileUpdate = useMemo(() => {
    if (userProfile) {
      return {
        displayName: userProfile.displayName ?? "",
        givenName: userProfile.givenName ?? "",
        surname: userProfile.surname ?? "",
        telephone: userProfile.telephone ?? "",
        address: userProfile.address ?? "",
      };
    } else {
      return {
        displayName: "",
        givenName: "",
        surname: "",
        telephone: "",
        address: "",
      };
    }
  }, [userProfile]);

  const errorMessageBar = useMemo(() => {
    if (error) {
      return (
        <MessageBar
          messageBarType={MessageBarType.error}
          isMultiline={true}
          onDismiss={() => setError(null)}
          dismissButtonAriaLabel="Close"
        >
          {error.render()}
        </MessageBar>
      );
    } else {
      return null;
    }
  }, [error]);

  const messageBoxElement = useMemo(() => {
    if (confirmDelete) {
      return (
        <Dialog
          hidden={false}
          onDismiss={() => setConfirmDelete(false)}
          dialogContentProps={deleteDialogContentProps}
          modalProps={modalProps}
        >
          <p className="mb-4">
            This will remove all your information from the workforce portal.
          </p>

          <p className="mb-4">
            Additionaly, if you have already submitted an application to
            Broadstairs Folk Week and would like to withdraw your application,
            please contact the Broadstairs Folk Week office directly.
          </p>

          <p>
            Would you like to delete your information from the workforce portal?
          </p>
          <DialogFooter>
            <PrimaryButton
              onClick={() => (window.location.pathname = "/api/deleteUser")}
              text="Delete"
            />
            <DefaultButton
              onClick={() => setConfirmDelete(false)}
              text="Cancel"
            />
          </DialogFooter>
        </Dialog>
      );
    } else {
      return null;
    }
  }, [confirmDelete]);

  const preFooter = useMemo(
    () => (
      <div className="px-2 text-right">
        <button
          onClick={() => setConfirmDelete(true)}
          disabled={confirmDelete}
          className="m-1 p-4 bg-red-300 hover:bg-red-500 rounded text-lg text-menu-text "
        >
          Delete my information
        </button>
      </div>
    ),
    [confirmDelete]
  );

  if (!userProfile) {
    return <h1>Not signed in</h1>;
  }

  return (
    <div>
      <h1 className="text-2xl font-black">Modify your profile</h1>
      <Formik
        initialValues={initialValues}
        enableReinitialize
        onSubmit={async (values) => {
          await dispatch(
            saveProfile({ version: userProfile.version, updates: values })
          )
            .unwrap()
            .then((resultEither) => {
              if (Either.isLeft(resultEither)) {
                const error = resultEither.left;
                if (error instanceof SaveProfileConflictError) {
                  setError(new SaveProfileConflictError());
                } else {
                  setError({
                    render: () => (
                      <div className="p-4 bg-red-100 rounded-lg overflow-hidden">
                        <p>
                          There was a problem updating your profile. Please try
                          again later.
                        </p>
                      </div>
                    ),
                  });
                }
              } else {
                navigate("/");
              }
            })
            .catch(() => {
              setError({
                render: () => (
                  <div className="p-4 bg-red-100 rounded-lg overflow-hidden">
                    <p>
                      There was a problem updating your profile. Please try
                      again later.
                    </p>
                  </div>
                ),
              });
            });
        }}
      >
        {(formik) => {
          return (
            <>
              {errorMessageBar}
              <form className="text-left" onSubmit={formik.handleSubmit}>
                <div className="mb-8">
                  <TextInput
                    name="displayName"
                    label="Display name"
                    type="text"
                  />
                </div>

                <div className="mb-8">
                  <TextInput
                    name="givenName"
                    label="Given (first) name"
                    type="text"
                  />
                  <TextInput name="surname" label="Surname" type="text" />
                </div>

                <div className="mb-8">
                  <TextArea name="address" label="Address (inc. postcode)" />
                  <TextInput name="telephone" label="Telephone" type="text" />
                </div>

                <div className="my-4 text-center">
                  <button
                    type="submit"
                    disabled={formik.isSubmitting}
                    className="mx-2 w-32 p-4 bg-bfw-yellow hover:bg-bfw-link rounded text-lg text-menu-text disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200 disabled:shadow-none"
                  >
                    Save Profile
                  </button>

                  <button
                    onClick={() => navigate("/")}
                    disabled={formik.isSubmitting}
                    className="mx-2 w-32 p-4 bg-bfw-yellow hover:bg-bfw-link rounded text-lg text-menu-text disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200 disabled:shadow-none"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </>
          );
        }}
      </Formik>
      {messageBoxElement}
    </div>
  );
};

export default ProfileForm;
