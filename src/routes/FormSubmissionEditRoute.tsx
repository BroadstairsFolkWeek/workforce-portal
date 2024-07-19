import { useDispatch, useSelector } from "react-redux";
import {
  saveExistingFormSubmission,
  selectFormSubmission,
} from "../features/forms/forms-slice";
import { useLoaderData } from "react-router-dom";
import { FormSubmissionId } from "../interfaces/form";

import { Params } from "react-router-dom";
import FormSubmissionEdit from "../components/FormSubmissionEdit";
import { AppDispatch } from "../store";
import { useCallback } from "react";

export async function FormSubmissionEditRouteLoader({
  params,
}: {
  params: Params;
}) {
  const formSubmissionId = params.formSubmissionId;
  return { formSubmissionId };
}

const FormSubmissionEditRoute = () => {
  const { formSubmissionId } = useLoaderData() as Awaited<
    ReturnType<typeof FormSubmissionEditRouteLoader>
  >;

  const dispatch: AppDispatch = useDispatch();

  const saveHandler = useCallback(
    (answers: unknown) => {
      if (!formSubmissionId) {
        return;
      }

      dispatch(
        saveExistingFormSubmission({
          formSubmissionId: FormSubmissionId.make(formSubmissionId),
          answers,
        })
      );
    },
    [dispatch, formSubmissionId]
  );

  if (formSubmissionId) {
    const formSubmission = useSelector(
      selectFormSubmission(FormSubmissionId.make(formSubmissionId))
    );
    if (formSubmission) {
      return (
        <FormSubmissionEdit
          formSubmission={formSubmission}
          onSave={saveHandler}
          // editButtonClicked={editHandler}
          // submitButtonClicked={handler}
          // retractButtonClicked={handler}
          // deleteButtonClicked={handler}
        />
      );
    } else {
      return null;
    }
  } else {
    return null;
  }
};

export default FormSubmissionEditRoute;
