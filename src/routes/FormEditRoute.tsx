import { useSelector } from "react-redux";
import { Params } from "react-router-dom";

import { selectForm } from "../features/forms/forms-slice";
import { useLoaderData } from "react-router-dom";
import { FormId } from "../interfaces/form";
import FormEdit from "../components/FormEdit";

export async function loader({ params }: { params: Params }) {
  const formId = params.formId;
  return { formId };
}

export const Component = () => {
  const { formId: formId } = useLoaderData() as Awaited<
    ReturnType<typeof loader>
  >;

  if (formId) {
    const form = useSelector(selectForm(FormId.make(formId)));
    if (form) {
      return <FormEdit form={form} />;
    } else {
      return null;
    }
  } else {
    return null;
  }
};

Component.displayName = "FormEditRoute";
