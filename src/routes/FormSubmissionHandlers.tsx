import { useDispatch } from "react-redux";
import {
  actionFormSubmission,
  createFormSubmission,
  deleteFormSubmission,
  saveExistingFormSubmission,
} from "../features/forms/forms-slice";
import { useCallback } from "react";
import { Template, Form } from "../interfaces/form";
import { AppDispatch } from "../store";
import { useNavigate } from "react-router-dom";

export const useFormSubmissionHandlers = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const navigateHome = useCallback(() => {
    navigate("/");
  }, [navigate]);

  const viewForm = useCallback(
    (form: Form) => {
      navigate(`/formSubmissions/${form.id}`);
    },
    [navigate]
  );

  const editForm = useCallback(
    (form: Form) => {
      navigate(`/formSubmissions/${form.id}/edit`);
    },
    [navigate]
  );

  const saveForm = useCallback(
    async (form: Form, answers: unknown) => {
      dispatch(
        saveExistingFormSubmission({
          formSubmissionId: form.id,
          answers,
        })
      );

      navigateHome();
    },
    [dispatch, navigateHome]
  );

  const submitForm = useCallback(
    async (form: Form) => {
      dispatch(
        actionFormSubmission({
          formSubmissionId: form.id,
          formSubmissionAction: "submit",
        })
      );

      navigateHome();
    },
    [dispatch, navigateHome]
  );

  const retractForm = useCallback(
    async (form: Form) => {
      dispatch(
        actionFormSubmission({
          formSubmissionId: form.id,
          formSubmissionAction: "retract",
        })
      );

      editForm(form);
    },
    [dispatch, editForm]
  );

  const deleteForm = useCallback(
    async (form: Form) => {
      dispatch(
        deleteFormSubmission({
          formSubmissionId: form.id,
        })
      );

      navigateHome();
    },
    [dispatch, navigateHome]
  );

  const displayNewForm = useCallback(
    (template: Template) => {
      navigate(`/creatableForms/${template.id}`);
    },
    [navigate]
  );

  const cancelNewForm = useCallback(() => {
    navigateHome();
  }, [navigateHome]);

  const createNewForm = useCallback(
    async (template: Template, answers: unknown) => {
      dispatch(createFormSubmission({ templateId: template.id, answers }));
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
