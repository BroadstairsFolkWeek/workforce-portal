import { PropsWithChildren, useCallback, useMemo } from "react";
import { DateTime } from "luxon";
import { Model, Question } from "survey-core";
import { Form } from "../interfaces/form";
import FormControls from "./FormControls";
import { useFormHandlers } from "../routes/FormHandlers";
import { Profile } from "../interfaces/profile";
import { Link } from "react-router-dom";

interface FormsListItemProps {
  form: Form;
  profile: Profile;
}

const ListItemHeader = ({
  form,
  children,
}: PropsWithChildren<{
  form: Form;
}>) => {
  return (
    <div className="bg-bfw-yellow">
      <div className="flex flex-row justify-between p-2 bg-bfw-yellow ">
        <div>{form.template.fullName}</div>
        <div className="text-xs">{form.submissionStatus}</div>
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

const FormsListItem: React.FC<FormsListItemProps> = ({ form, profile }) => {
  const { viewForm, editForm, submitForm, retractForm, deleteForm } =
    useFormHandlers();

  const viewFormHandler = useCallback(() => {
    viewForm(form);
  }, [viewForm, form]);

  const editFormHandler = useCallback(() => {
    editForm(form);
  }, [editForm, form]);

  const submitFormHandler = useCallback(async () => {
    await submitForm(form);
  }, [submitForm, form]);

  const retractFormHandler = useCallback(async () => {
    await retractForm(form);
    editForm(form);
  }, [retractForm, editForm, form]);

  const deleteFormHandler = useCallback(async () => {
    await deleteForm(form);
  }, [deleteForm, form]);

  const questionsInError = useMemo(() => {
    const m = new Model(form.template.questions);
    m.data = form.answers;
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
  }, [form]);

  const actionRequiredComponent = useMemo(() => {
    const formProfileRequirements =
      form.template.otherDataRequirements.profileRequirements;
    const formRequiresProfile = formProfileRequirements.length > 0;
    const profileNeeded =
      formRequiresProfile && profile.metadata.profileInformationRequired;

    if (form.submissionStatus === "draft") {
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
        profile.metadata.photoRequired &&
        form.template.otherDataRequirements.profilePhotoRequired
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
    } else if (form.submissionStatus === "submittable") {
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
  }, [form, questionsInError]);

  return (
    <div className="flex flex-col bg-yellow-100 rounded-lg overflow-hidden">
      <ListItemHeader form={form}>{actionRequiredComponent}</ListItemHeader>

      <div className="flex flex-row">
        <div className="p-4 flex-grow overflow-hidden">
          <div className="text-sm">
            Last saved:{" "}
            {DateTime.fromISO(form.modifiedDateTimeUtc).toLocaleString(
              DateTime.DATETIME_MED
            )}
          </div>
        </div>
        <div className="py-4 pr-2 w-40">
          <FormControls
            viewForm={viewFormHandler}
            editForm={editFormHandler}
            form={form}
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

export default FormsListItem;
