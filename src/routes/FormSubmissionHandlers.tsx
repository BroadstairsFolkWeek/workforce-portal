import { useDispatch } from "react-redux";
import {
  actionFormSubmission,
  createFormSubmission,
  deleteFormSubmission,
  saveExistingFormSubmission,
} from "../features/forms/forms-slice";
import { useCallback } from "react";
import { FormSpec, FormSubmission } from "../interfaces/form";
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

  const displayNewForm = useCallback(
    (formSpec: FormSpec) => {
      navigate(`/creatableForms/${formSpec.id}`);
    },
    [navigate]
  );

  const cancelNewForm = useCallback(() => {
    navigateHome();
  }, [navigateHome]);

  const createNewForm = useCallback(
    async (formSpec: FormSpec, answers: unknown) => {
      dispatch(createFormSubmission({ formSpecId: formSpec.id, answers }));
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
    displayNewForm,
    cancelNewForm,
    createNewForm,
  } as const;
};
