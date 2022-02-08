import { MessageBar, MessageBarType } from "@fluentui/react";
import { Formik } from "formik";
import { useMemo, useState } from "react";
import { ErrorRenderer } from "../../interfaces/error-renderer";
import {
  UserProfileUpdate,
  useUserProfile,
} from "../contexts/UserProfileContext";
import { SaveProfileConflictError } from "../errors/user-profile-errors";
import { TextArea, TextInput } from "./Fields";

export interface ProfileFormProps {
  onSaved: () => void;
  onCancel: () => void;
  onSaving?: () => void;
  onSaveError?: () => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  onSaving,
  onSaved,
  onSaveError,
  onCancel,
}) => {
  const { userProfile, saveUserProfile } = useUserProfile();
  const [error, setError] = useState<ErrorRenderer | null>(null);

  const initialValues: UserProfileUpdate = useMemo(() => {
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

  if (!userProfile) {
    return <h1>Not signed in</h1>;
  }

  return (
    <Formik
      initialValues={initialValues}
      enableReinitialize
      onSubmit={async (values, { setSubmitting }) => {
        if (onSaving) {
          onSaving();
        }

        const saveStatus = await saveUserProfile(values);

        if (saveStatus !== 200) {
          switch (saveStatus) {
            case 409:
              setError(new SaveProfileConflictError());
              break;

            default:
              <div className="p-4 bg-red-100 rounded-lg overflow-hidden">
                <p>
                  There was a problem updating your profile. Please try again
                  later.
                </p>
              </div>;
              break;
          }

          if (onSaveError) {
            onSaveError();
          }
        } else {
          onSaved();
        }
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
                  onClick={onCancel}
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
  );
};

export default ProfileForm;
