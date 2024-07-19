import { useSelector } from "react-redux";
import { selectFormSubmission } from "../features/forms/forms-slice";
import { useLoaderData, useNavigate } from "react-router-dom";
import FormSubmissionView from "../components/FormSubmissionView";
import { FormSubmissionId } from "../interfaces/form";

import { Params } from "react-router-dom";
import { useCallback } from "react";

export async function FormSubmissionRouteLoader({
  params,
}: {
  params: Params;
}) {
  const formSubmissionId = params.formSubmissionId;
  return { formSubmissionId };
}

const FormSubmissionRoute = () => {
  const { formSubmissionId } = useLoaderData() as Awaited<
    ReturnType<typeof FormSubmissionRouteLoader>
  >;

  const navigate = useNavigate();

  const handler = useCallback(() => {}, []);

  const editHandler = useCallback(() => {
    navigate(`/formSubmissions/${formSubmissionId}/edit`);
  }, [formSubmissionId]);

  if (formSubmissionId) {
    const formSubmission = useSelector(
      selectFormSubmission(FormSubmissionId.make(formSubmissionId))
    );
    if (formSubmission) {
      return (
        <FormSubmissionView
          formSubmission={formSubmission}
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

export default FormSubmissionRoute;
