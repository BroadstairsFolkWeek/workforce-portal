import { useDispatch } from "react-redux";
import {
  actionFormSubmission,
  deleteFormSubmission,
  saveExistingFormSubmission,
} from "../features/forms/forms-slice";
import { useCallback } from "react";
import { FormSubmission } from "../interfaces/form";
import { AppDispatch } from "../store";
import { useNavigate } from "react-router-dom";

export const useFormSubmissionHandlers = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const navigateHome = useCallback(() => {
    navigate("/");
  }, [navigate]);

  const viewForm = useCallback(
    (formSubmission: FormSubmission) => {
      navigate(`/formSubmissions/${formSubmission.id}`);
    },
    [navigate]
  );

  const editForm = useCallback(
    (formSubmission: FormSubmission) => {
      navigate(`/formSubmissions/${formSubmission.id}/edit`);
    },
    [navigate]
  );

  const saveForm = useCallback(
    async (formSubmission: FormSubmission, answers: unknown) => {
      await dispatch(
        saveExistingFormSubmission({
          formSubmissionId: formSubmission.id,
          answers,
        })
      );
    },
    [dispatch]
  );

  const submitForm = useCallback(
    async (formSubmission: FormSubmission) => {
      await dispatch(
        actionFormSubmission({
          formSubmissionId: formSubmission.id,
          formSubmissionAction: "submit",
        })
      );
    },
    [dispatch]
  );

  const retractForm = useCallback(
    async (formSubmission: FormSubmission) => {
      await dispatch(
        actionFormSubmission({
          formSubmissionId: formSubmission.id,
          formSubmissionAction: "retract",
        })
      );
    },
    [dispatch]
  );

  const deleteForm = useCallback(
    async (formSubmission: FormSubmission) => {
      await dispatch(
        deleteFormSubmission({
          formSubmissionId: formSubmission.id,
        })
      );
    },
    [dispatch]
  );

  return {
    navigateHome,
    viewForm,
    editForm,
    saveForm,
    submitForm,
    retractForm,
    deleteForm,
  } as const;
};
