import { useSelector } from "react-redux";
import { selectForm } from "../features/forms/forms-slice";
import { useLoaderData, useNavigate } from "react-router-dom";
import FormView from "../components/FormView";
import { FormId } from "../interfaces/form";

import { Params } from "react-router-dom";
import { useCallback } from "react";

export async function loader({ params }: { params: Params }) {
  const formId = params.formId;
  return { formId };
}

export const Component = () => {
  const { formId } = useLoaderData() as Awaited<ReturnType<typeof loader>>;

  const navigate = useNavigate();

  const handler = useCallback(() => {}, []);

  const editHandler = useCallback(() => {
    navigate(`/forms/${formId}/edit`);
  }, [formId]);

  if (formId) {
    const form = useSelector(selectForm(FormId.make(formId)));
    if (form) {
      return (
        <FormView
          form={form}
          editButtonClicked={editHandler}
          submitButtonClicked={handler}
          retractButtonClicked={handler}
          deleteButtonClicked={handler}
        />
      );
    } else {
      return null;
    }
  } else {
    return null;
  }
};

Component.displayName = "FormRoute";
