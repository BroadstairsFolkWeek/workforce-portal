import { useDispatch } from "react-redux";
import {
  actionForm,
  createForm,
  deleteForm as deleteFormAction,
  saveExistingForm,
} from "../features/forms/forms-slice";
import { useCallback } from "react";
import { Template, Form } from "../interfaces/form";
import { AppDispatch } from "../store";
import { useNavigate } from "react-router-dom";

export const useFormHandlers = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const navigateHome = useCallback(() => {
    navigate("/");
  }, [navigate]);

  const viewForm = useCallback(
    (form: Form) => {
      navigate(`/forms/${form.id}`);
    },
    [navigate]
  );

  const editForm = useCallback(
    (form: Form) => {
      navigate(`/forms/${form.id}/edit`);
    },
    [navigate]
  );

  const saveForm = useCallback(
    async (form: Form, answers: unknown) => {
      dispatch(
        saveExistingForm({
          formId: form.id,
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
        actionForm({
          formId: form.id,
          formAction: "submit",
        })
      );

      navigateHome();
    },
    [dispatch, navigateHome]
  );

  const retractForm = useCallback(
    async (form: Form) => {
      dispatch(
        actionForm({
          formId: form.id,
          formAction: "retract",
        })
      );

      editForm(form);
    },
    [dispatch, editForm]
  );

  const deleteForm = useCallback(
    async (form: Form) => {
      dispatch(
        deleteFormAction({
          formId: form.id,
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
      dispatch(createForm({ templateId: template.id, answers }));
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
