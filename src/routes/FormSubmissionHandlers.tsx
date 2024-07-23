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
      dispatch(
        saveExistingFormSubmission({
          formSubmissionId: formSubmission.id,
          answers,
        })
      );

      navigateHome();
    },
    [dispatch, navigateHome]
  );

  const submitForm = useCallback(
    async (formSubmission: FormSubmission) => {
      dispatch(
        actionFormSubmission({
          formSubmissionId: formSubmission.id,
          formSubmissionAction: "submit",
        })
      );

      navigateHome();
    },
    [dispatch, navigateHome]
  );

  const retractForm = useCallback(
    async (formSubmission: FormSubmission) => {
      dispatch(
        actionFormSubmission({
          formSubmissionId: formSubmission.id,
          formSubmissionAction: "retract",
        })
      );

      editForm(formSubmission);
    },
    [dispatch, editForm]
  );

  const deleteForm = useCallback(
    async (formSubmission: FormSubmission) => {
      dispatch(
        deleteFormSubmission({
          formSubmissionId: formSubmission.id,
        })
      );

      navigateHome();
    },
    [dispatch, navigateHome]
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
