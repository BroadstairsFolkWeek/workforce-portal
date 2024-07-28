import { PropsWithChildren, useCallback, useMemo } from "react";
import { DateTime } from "luxon";
import { Model, Question } from "survey-core";
import { Form } from "../interfaces/form";
import FormSubmissionControls from "./FormSubmissionControls";
import { useFormSubmissionHandlers } from "../routes/FormSubmissionHandlers";
import { Profile } from "../interfaces/profile";
import { Link } from "react-router-dom";

interface FormSubmissionListItemProps {
  formSubmission: Form;
  profile: Profile;
}

const ListItemHeader = ({
  formSubmission,
  children,
}: PropsWithChildren<{
  formSubmission: Form;
}>) => {
  return (
    <div className="bg-bfw-yellow">
      <div className="flex flex-row justify-between p-2 bg-bfw-yellow ">
        <div>{formSubmission.template.fullName}</div>
        <div className="text-xs">{formSubmission.submissionStatus}</div>
      </div>
      <div className="px-2">{children}</div>
    </div>
  );
};

const ListItemFooter = ({
  children,
  questionsInError,
}: PropsWithChildren<{
  questionsInError: string[];
}>) => {
  const todoComponent = useMemo(() => {
    if (questionsInError.length > 0) {
      return (
        <div className="text-sm text-white-200">
          Please EDIT this form and provide the following information:
          <ul className="ml-4">
            {questionsInError.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        </div>
      );
    } else {
      return null;
    }
  }, [questionsInError]);

  return (
    <div className="bg-bfw-yellow">
      <div className="flex flex-col justify-between p-2 bg-black text-xs text-white">
        <div>{todoComponent}</div>
      </div>
      <div className="px-2">{children}</div>
    </div>
  );
};

const FormSubmissionListItem: React.FC<FormSubmissionListItemProps> = ({
  formSubmission,
  profile,
}) => {
  const { viewForm, editForm, submitForm, retractForm, deleteForm } =
    useFormSubmissionHandlers();

  const viewFormHandler = useCallback(() => {
    viewForm(formSubmission);
  }, [viewForm, formSubmission]);

  const editFormHandler = useCallback(() => {
    editForm(formSubmission);
  }, [editForm, formSubmission]);

  const submitFormHandler = useCallback(async () => {
    await submitForm(formSubmission);
  }, [submitForm, formSubmission]);

  const retractFormHandler = useCallback(async () => {
    await retractForm(formSubmission);
    editForm(formSubmission);
  }, [retractForm, editForm, formSubmission]);

  const deleteFormHandler = useCallback(async () => {
    await deleteForm(formSubmission);
  }, [deleteForm, formSubmission]);

  const questionsInError = useMemo(() => {
    const m = new Model(formSubmission.template.questions);
    m.data = formSubmission.answers;
    const answersAreValid = m.validate();

    if (!answersAreValid) {
      console.error("Answers are not valid");
    }

    // Run the validation process, recording any question that fails validation.
    const validationFailedQuestions: Question[] = [];
    m.onSettingQuestionErrors.add((sender, options) => {
      if (options.errors.length > 0) {
        validationFailedQuestions.push(options.question);
      }
    });
    // Get the validation results from the survey model.
    m.validate();

    // If there are validation errors, return the list of questions that failed validation.
    if (validationFailedQuestions.length > 0) {
      return validationFailedQuestions.map((q) => q.title);
    } else {
      return [];
    }
  }, [formSubmission]);

  const actionRequiredComponent = useMemo(() => {
    const formProfileRequirementsOb =
      formSubmission.template.requirements.profileRequirements;
    const formRequiresProfile =
      formProfileRequirementsOb.displayName ||
      formProfileRequirementsOb.email ||
      formProfileRequirementsOb.telephone ||
      formProfileRequirementsOb.firstName ||
      formProfileRequirementsOb.surname ||
      formProfileRequirementsOb.address;
    const profileNeeded =
      formRequiresProfile && profile.meta.profileInformationRequired;

    if (formSubmission.submissionStatus === "draft") {
      if (questionsInError.length > 0) {
        return (
          <div>
            ACTION Required:{" "}
            <button onClick={editFormHandler} className="underline">
              Edit this form
            </button>{" "}
            to add missing information and then click save.
          </div>
        );
      } else if (
        profile.meta.photoRequired &&
        formSubmission.template.requirements.profileRequirements.photo
      ) {
        return (
          <div>
            ACTION Required:{" "}
            <Link to="/profilePhoto" className="underline">
              Upload a profile photo
            </Link>{" "}
            before submitting this form.
          </div>
        );
      } else if (profileNeeded) {
        return (
          <div>
            ACTION Required:{" "}
            <Link to="/profile" className="underline">
              Fill in your profile
            </Link>{" "}
            before submitting this form.
          </div>
        );
      }
    } else if (formSubmission.submissionStatus === "submittable") {
      return (
        <div>
          ACTION Required: If you are happy with the information provided, click{" "}
          <button onClick={submitFormHandler} className="underline">
            Submit
          </button>{" "}
          to submit the form to Broadstairs Folk Week.
        </div>
      );
    }
  }, [formSubmission, questionsInError]);

  return (
    <div className="flex flex-col bg-yellow-100 rounded-lg overflow-hidden">
      <ListItemHeader formSubmission={formSubmission}>
        {actionRequiredComponent}
      </ListItemHeader>

      <div className="flex flex-row">
        <div className="p-4 flex-grow overflow-hidden">
          <div className="text-sm">
            Last saved:{" "}
            {DateTime.fromISO(
              formSubmission.modifiedDateTimeUtc
            ).toLocaleString(DateTime.DATETIME_MED)}
          </div>
        </div>
        <div className="py-4 pr-2 w-40">
          <FormSubmissionControls
            viewForm={viewFormHandler}
            editForm={editFormHandler}
            formSubmission={formSubmission}
            submitForm={submitFormHandler}
            retractForm={retractFormHandler}
            deleteForm={deleteFormHandler}
          />
        </div>
      </div>
      <ListItemFooter questionsInError={questionsInError} />
    </div>
  );
};

export default FormSubmissionListItem;
