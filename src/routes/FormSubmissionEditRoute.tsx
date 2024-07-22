import { useSelector } from "react-redux";
import { Params } from "react-router-dom";

import { selectFormSubmission } from "../features/forms/forms-slice";
import { useLoaderData } from "react-router-dom";
import { FormSubmissionId } from "../interfaces/form";
import FormSubmissionEdit from "../components/FormSubmissionEdit";

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

  if (formSubmissionId) {
    const formSubmission = useSelector(
      selectFormSubmission(FormSubmissionId.make(formSubmissionId))
    );
    if (formSubmission) {
      return <FormSubmissionEdit formSubmission={formSubmission} />;
    } else {
      return null;
    }
  } else {
    return null;
  }
};

export default FormSubmissionEditRoute;
