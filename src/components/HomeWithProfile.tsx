import { useMemo } from "react";
import { Link } from "react-router-dom";
import FormSubmissionList from "./FormSubmissionsList";
import { Profile } from "../interfaces/profile";
import { Template, Form } from "../interfaces/form";
import CreatableFormsList from "./CreatableFormsList";
import { MessageBar, MessageBarType } from "@fluentui/react";
import { useSelector } from "react-redux";
import {
  selectFormsLoadingStatus,
  selectFormsSavingStatus,
} from "../features/forms/forms-slice";
import { LoadFormError, SaveFormError } from "./errors/forms-errors";
import { selectProfileLoadingStatus } from "../features/profile/profile-slice";
import { LoadProfileError } from "./errors/user-profile-errors";

export interface HomeWithProfileProps {
  profile: Profile;
  formSubmissions: readonly Form[];
  creatableForms: readonly Template[];
}

const HomeWithProfile: React.FC<HomeWithProfileProps> = ({
  profile,
  formSubmissions,
  creatableForms,
}) => {
  const profileLoadingStatus = useSelector(selectProfileLoadingStatus);
  const formsSavingStatus = useSelector(selectFormsSavingStatus);
  const formsLoadingStatus = useSelector(selectFormsLoadingStatus);

  const profileReminder = useMemo(() => {
    if (profile.metadata.photoRequired) {
      return (
        <div className="m-4 p-4 bg-red-200 outline outline-4 outline-yellow-100 rounded-lg">
          Please{" "}
          <Link to="/profilePhoto" className="underline">
            upload a profile photo
          </Link>{" "}
          as it may be needed as part of a form submission.
        </div>
      );
    } else if (profile.metadata.profileInformationRequired) {
      return (
        <div className="m-4 p-4 bg-red-200 outline outline-4 outline-yellow-100 rounded-lg">
          Please{" "}
          <Link to="/profile" className="underline">
            fill in your profile
          </Link>{" "}
          as it may be needed as part of a form submission.
        </div>
      );
    } else {
      return null;
    }
  }, [profile]);

  if (profileLoadingStatus === "error") {
    return (
      <MessageBar messageBarType={MessageBarType.error} isMultiline={true}>
        <LoadProfileError />
      </MessageBar>
    );
  }

  if (formsLoadingStatus === "error") {
    return (
      <MessageBar messageBarType={MessageBarType.error} isMultiline={true}>
        <LoadFormError />
      </MessageBar>
    );
  }

  if (formsSavingStatus === "error") {
    return (
      <MessageBar messageBarType={MessageBarType.error} isMultiline={true}>
        <SaveFormError />
      </MessageBar>
    );
  }

  return (
    <div>
      {profileReminder}
      {formSubmissions.length > 0 ? (
        <div className="space-y-2 text-left">
          <h1 className="text-xl">Your forms</h1>
          <FormSubmissionList
            formSubmissions={formSubmissions}
            profile={profile}
          />
        </div>
      ) : null}
      {creatableForms.length > 0 ? (
        <div className="space-y-2 text-left">
          <h1 className="text-xl">Creatable forms</h1>
          <CreatableFormsList creatableForms={creatableForms} />
        </div>
      ) : null}
    </div>
  );
};

export default HomeWithProfile;
