import { useSelector } from "react-redux";
import { Params } from "react-router-dom";

import { selectFormSubmission } from "../features/forms/forms-slice";
import { useLoaderData } from "react-router-dom";
import { FormId } from "../interfaces/form";
import FormSubmissionEdit from "../components/FormSubmissionEdit";

export async function loader({ params }: { params: Params }) {
  const formSubmissionId = params.formSubmissionId;
  return { formSubmissionId };
}

export const Component = () => {
  const { formSubmissionId } = useLoaderData() as Awaited<
    ReturnType<typeof loader>
  >;

  if (formSubmissionId) {
    const formSubmission = useSelector(
      selectFormSubmission(FormId.make(formSubmissionId))
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

Component.displayName = "FormSubmissionEditRoute";
