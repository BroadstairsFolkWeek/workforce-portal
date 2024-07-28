import { useSelector } from "react-redux";
import { Params, useLoaderData } from "react-router-dom";

import { selectCreatableForm } from "../features/forms/forms-slice";
import { TemplateId } from "../interfaces/form";
import CreatableFormNew from "../components/CreatableFormNew";

export async function loader({ params }: { params: Params }) {
  const creatableFormId = params.creatableFormId;
  return { creatableFormId };
}

export const Component = () => {
  const { creatableFormId } = useLoaderData() as Awaited<
    ReturnType<typeof loader>
  >;

  if (creatableFormId) {
    const creatableForm = useSelector(
      selectCreatableForm(TemplateId.make(creatableFormId))
    );
    if (creatableForm) {
      return <CreatableFormNew creatableForm={creatableForm} />;
    } else {
      return null;
    }
  } else {
    return null;
  }
};

Component.displayName = "CreatableFormNewRoute";
